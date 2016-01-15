import r from 'superagent'
import { pushState } from 'redux-router'
import { createAction } from 'redux-actions'

import { loadTrending, trendingFinished, loadRepos, reposFinished } from 'actions/loader'
import config from 'config'

const api = config.getApi()

/**
 * Get all repos
 */

const reposFetched = createAction('REPOS_FETCHED')

export const fetchAllRepos = () => dispatch => {
  return new Promise((resolve, reject) => {

    dispatch(loadRepos())

    r.get(`${api}/repos`)
      .end((err, res) => {
        dispatch(reposFinished())
        if (err) { return reject(err) }

        const repos = res.body
        dispatch(reposFetched(repos))
        resolve(repos)
      })
  })
}

/**
 * Get random repos
 */

const trendingFetched = createAction('TRENDING_FETCHED')

export const fetchTrendingRepos = () => dispatch => {
  return new Promise((resolve, reject) => {

    dispatch(loadTrending())

    r.get(`${api}/random-repos`)
      .end((err, res) => {
        dispatch(trendingFinished())
        if (err) { return reject(err) }

        dispatch(trendingFetched(res.body))
        resolve()
      })
  })
}

/**
 * Clear repo cache
 */
export const deleteFromCache = repo => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    r.put(`${api}/repos/${repo._id}`)
      .end((err, res) => {
        if (err) { return reject(err) }
      })
  })
}

/**
 * Go to repo
 */
export const goToRepo = repo => dispatch => {
  dispatch(setCurrent(repo))
  dispatch(pushState(null, `${repo.name}`))
}

export const setCurrent = createAction('SET_CURRENT', repo => repo)

/**
 * Ask for a repo
 */
export const askRepo = repo => dispatch => new Promise((resolve, reject) => {
  if (repo.stars) { return resolve() }
  r.get(`${api}/repos/${repo.name}`)
    .end((err, res) => {
      if (err) { return reject(err) }
      const repo = res.body
      dispatch(repoResolved(repo))
      resolve(repo)
    })
})

export const askAndGo = repo => dispatch => {
  return dispatch(askRepo(repo))
    .then(repo => dispatch(goToRepo(repo)))
}

export const repoResolved = createAction('REPO_RESOLVED', repo => repo)
