import q from 'q'
import r from 'superagent'
import Vibrant from 'node-vibrant'

import Repo from 'api/Repo.model'
import { getSocketServer } from 'api/io'

import featuredRepos from 'data/featuredRepos'
import { initRepo } from 'api/github.worker'

const githubToken = process.env.GITHUB

let trendingRepos = []

/**
 * Fetch all repos summaries
 */
export const getAll = () => {
  return q.nfcall(::Repo.find, {}, 'name summary')
}

/**
 * Refresh all the repos, scheduled each day
 */
export const refreshAll = () => {
  return getAll().then(repos => repos.forEach(repo => initRepo(repo.name)))
}

/**
 * Refresh one repo, and perform a full refresh if boolean is true
 */
export const refreshOne = (repoName, fullRefresh) => {
  return initRepo(repoName, fullRefresh)
}

/**
 * Retrieve the featured repos
 */
export const getFeatured = () => {
  const queries = featuredRepos.map(n => getByName(n, 'name summary stars'))
  return Promise.all(queries)
}

/**
 * Retrieve the trending repos
 */
export const getTrending = () => {
  const queries = trendingRepos.map(n => getByName(n, 'name summary stars'))
  return Promise.all(queries)
}

/**
 * Refresh the trending repos each day
 * Using Bridge API
 */
export const refreshTrending = () => {

  console.log(`Starting trending refresh.`) // eslint-disable-line

  return new Promise((resolve, reject) => {
    r.get('http://bridge.sigsev.io/github/trending')
      .end((err, res) => {
        if (err) { return reject(err) }
        const repos = res.body.slice(0, 8)
        resolve(repos.map(r => r.url.substring(1)))
      })
  })
  .then(names => Promise.all(names.map(name => initRepo(name))))
  .then(repos => {
    trendingRepos = repos.map(r => r.name)
    console.log('Finished trending refresh.') // eslint-disable-line
  })
}

/**
 * Get a full repo
 */
export const getByName = (name, projection = {}) => {
  return q.nfcall(::Repo.findOne, { name }, projection)
}

/**
 * Get the repo ranking for badge response
 */
export const getRanking = name => {
  return q.nfcall(::Repo.findOne, { name }, 'cache')
    .then(repo => repo.cache.rank)
}

/**
 * Get nbars for a repo
 */
export const getBars = (name, n = 20) => {
  return q.nfcall(::Repo.findOne, { name }, 'stars.byDay')
    .then(({ stars: ({ byDay: stars }) }) => stars)
    .then(stars => stars.slice(-n))
}

/**
 * Remove a repo
 */
export const removeByName = name => {
  return q.nfcall(::Repo.remove, { name })
}

/**
 * Update repo
 */
export const updateByName = (name, mods) => {
  return q.nfcall(::Repo.update, { name }, mods)
    .then(() => null)
}

/**
 * Get a populated repo, without cache
 */
export const getOnePopulated = name => {
  return q.nfcall(::Repo.findOne, { name }, '-cache')
}

const starProgress = {}

/**
 * Fetch github stars
 */
const fetchStarPage = (name, _id, starsCount, page, io) => {

  return q.Promise((resolve, reject) => {

    r.get(`https://api.github.com/repos/${name}/stargazers?page=${page}&per_page=100`)
      .set('Authorization', `token ${githubToken}`)
      .set('Accept', 'application/vnd.github.v3.star+json')
      .end((err, res) => {

        if (err) { return reject(err) }
        // Finish once we reached the Github API limit
        if (res.statusCode === 422) { return resolve([]) }

        const stars = res.body.map(star => ({ date: star.starred_at, page }))

        starProgress[name] += res.body.length
        const value = ((starProgress[name] / starsCount) * 100).toFixed(2)

        if (io) { io.repoProgress({ _id, value }) }

        if (res.body.length === 100) {
          return fetchStarPage(name, _id, starsCount, ++page, io)
            .then(data => { resolve(data.concat(stars)) })
            .catch(reject)
        }

        resolve(stars)
      })

  })

}

export const fetchStars = ({ _id, name, summary: { starsCount } }, fromPage) => {
  starProgress[name] = 0
  const io = getSocketServer()
  return fetchStarPage(name, _id, starsCount, fromPage, io)
}

/**
 * Create event
 */
export const createEvent = ({ name, data: { title, link, comment } }) => {
  if (!title && !comment && !link) { return q.reject(new Error('Say something maybe?')) }
  return updateByName(name, { $push: { events: { title, link, comment } } })
}

const extractColor = url => {
  return q.Promise(resolve => {

    r.get(url)
      .end((err, res) => {
        if (err) { return resolve(null) }
        const v = new Vibrant(res.body)

        v.getPalette((err, palette) => {
          if (err || !palette.Vibrant) { return resolve(null) }
          resolve(palette.Vibrant.getHex())
        })
      })

  })
}

export const fetchRepo = name => {

  return q.Promise((resolve, reject) => {
    r.get(`https://api.github.com/repos/${name}`)
      .set('Authorization', `token ${githubToken}`)
      .end((err, res) => {
        if (err) { return reject(err) }

        const src = res.body

        const picture = src.owner.avatar_url
        extractColor(picture)
          .then(mainColor => {

            resolve({
              name,
              summary: {
                picture,
                mainColor,
                lastFetch: new Date(),
                language: src.language,
                createdAt: src.created_at,
                description: src.description,
                starsCount: src.stargazers_count,
                forksCount: src.forks,
                watchersCount: src.subscribers_count
              }
            })

          })

      })
  })

}

export const ask = repoName => {
  return getByName(repoName)
    .then(repo => {
      if (!repo) { return initRepo(repoName) }
      return repo
    })
}
