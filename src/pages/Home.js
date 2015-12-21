import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Select from 'react-select'

import { resetRepo, fetchAndGo } from 'actions/repos'

import RepoLink from 'components/RepoLink'

@connect(
  state => ({
    repo: state.repos.current,
    reposList: state.repos.list,
    loading: state.loader.global
  })
)
class Home extends Component {

  handleSearch (search) {
    if (search && search.value) {
      const { name } = search.value
      this.props.dispatch(fetchAndGo(name))
    } else {
      this.props.dispatch(resetRepo())
    }
  }

  renderOption (option) {
    const repo = option.value
    const { name, starsCount } = repo

    return (
      <div className='repo-option'>
        <div className='name'>
          <i className='octicon octicon-repo' />
          <h4>{name}</h4>
        </div>
        <div className='infos'>
          <span>{starsCount}</span>
          <i className='octicon octicon-star' />
        </div>
      </div>
    )
  }

  startSubmitRepo (e) {
    if (e) { e.preventDefault() }
    alert('coming soon, bro')
  }

  render () {
    const { repo, reposList, loading } = this.props

    const options = reposList.map(r => ({ value: r, label: r.name }))
    const selectValue = repo ? { value: repo, label: repo.name } : null

    return (
      <div>

        <div className='contained'>

          <h1>
            {'Add a new dimension to Github st'}
            <i className='mega-octicon octicon-star' />
            {'rs.'}
          </h1>

          <div className='search-container'>
            {loading && (
              <div className='search-loader'>{'Loading...'}</div>
            )}
            {!loading && (
              <Select
                value={selectValue}
                options={options}
                placeholder='Find a repo'
                optionRenderer={::this.renderOption}
                onChange={::this.handleSearch}
                className='repo-search'/>
            )}
          </div>

          <hr />

          <h2>
            {'No idea? You can '}
            <a href='' onClick={::this.startSubmitRepo}>
              <i className='octicon octicon-plus' />
              {' submit a repo'}
            </a>
            {' or check this '}
            <strong>{'awesome'}</strong>
            {' selection:'}
          </h2>

          <ul className='collection'>

            <li>
              <div className='repo'>
                <header>
                  <RepoLink to='SIGSEV/minus'>
                    {'SIGSEV/minus'}
                  </RepoLink>
                </header>
              </div>
            </li>

            <li>
              <div className='repo'>
                <header>
                  <RepoLink to='rackt/redux'>
                    {'rackt/redux'}
                  </RepoLink>
                </header>
              </div>
            </li>

            <li>
              <div className='repo'>
                <header>
                  <RepoLink to='42Zavattas/generator-bangular'>
                    {'42Zavattas/generator-bangular'}
                  </RepoLink>
                </header>
              </div>
            </li>

            <li>
              <div className='repo'>
                <header>
                  <RepoLink to='jaredreich/notie.js'>
                    {'jaredreich/notie.js'}
                  </RepoLink>
                </header>
              </div>
            </li>

          </ul>

          <div className='collection-actions'>
            <Link to='/browse'>
              {'Browse all repos '}
              <i className='octicon octicon-chevron-right' />
            </Link>
          </div>

          <hr />

          <div className='explain'>
            <h3>{'Analyse stars origin in time'}</h3>
            <p>
              {'Easily detect importants stars movement, and link them with events (social event, releases, etc.). Display all of that in a nice manner, and you make the world a better place. Here. Now.'}
            </p>
          </div>

          <div className='explain'>
            <h3>{'Visualize tech choices directions'}</h3>
            <p>
              {'Github stars are a '}
              <strong>{'very good'}</strong>
              {' indicator of the "health" of a project. But sometimes they can be "false positive". Observe star progression to see if the repo is still liked!'}
            </p>
          </div>

          <div className='z' style={{ margin: '4em 0' }}>
            <button className='b' onClick={::this.startSubmitRepo}>
              <i className='octicon octicon-plus' />
              {'Submit your repo now!'}
            </button>
          </div>

          <hr />

          <h2>{'"Why have I to submit my repo and don\'t see results instantly?"'}</h2>

          <p>
            <a href='https://github.com/SIGSEV/Starveller/pulls' target='_blank'>
              {'PR accepted'}
            </a>
            {'.'}
          </p>

        </div>

      </div>
    )
  }

}

export default Home
