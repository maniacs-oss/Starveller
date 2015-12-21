import { handleActions } from 'redux-actions'

const state = {
  current: null,
  list: []
}

export default handleActions({

  /**
   * Fill the current repo
   */
  REPO_FETCHED: (state, { payload: current }) => ({ ...state, current }),

  /**
   * Reset the current repo
   */
  REPO_RESET: (state) => ({ ...state, current: null }),

  /**
   * Fill repos basic list (only a few props like name, starsCount, etc.)
   */
  REPOS_LIST_FETCHED: (state, { payload: list }) => ({ ...state, list })

}, state)
