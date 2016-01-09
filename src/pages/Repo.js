if (process.env.BROWSER) { require('styles/Repo.scss') }

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import StarsEvolution from 'components/graphs/StarsEvolution'

import { deleteFromCache } from 'actions/repos'

@connect(
  state => ({
    repo: state.repos.current
  })
)
class Repo extends Component {

  handleClearCache (e) {
    e.preventDefault()
    const { repo } = this.props
    this.props.dispatch(deleteFromCache(repo))
  }

  render () {
    const { repo } = this.props

    return (
      <div>

        <header className='repo-header'>

          <Link to='/' className='back'>
            <i className='octicon octicon-chevron-left' />
            {' Back'}
          </Link>

          <div className='repo-name'>
            <a target='_blank' href={`https://github.com/${repo.name}`} style={{ marginRight: '0.5em' }}>
              <i className='octicon octicon-mark-github' />
            </a>
            {repo.name}
            {' - '}
            <a href='' onClick={::this.handleClearCache}>{'Clear cache'}</a>
          </div>

        </header>

        <section className='graphs-container'>

          <section className='graph'>
            <StarsEvolution repo={repo} loading={!repo.complete} />
          </section>

        </section>

      </div>
    )
  }

}

export default Repo
