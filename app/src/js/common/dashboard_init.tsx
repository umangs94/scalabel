import { MuiThemeProvider } from '@material-ui/core/styles'
import React from 'react'
import ReactDOM from 'react-dom'
import Dashboard from '../components/dashboard_window'
import { DashboardContents } from '../functional/types'
import { myTheme } from '../styles/theme'

/**
 * This function post requests to backend to retrieve dashboard contents
 */
export function initDashboard (vendor?: boolean) {
  let dashboardContents: DashboardContents
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      dashboardContents = JSON.parse(xhr.responseText)
      ReactDOM.render(
              <MuiThemeProvider theme={myTheme}>
                <p> .Project.Options.Name </p>
                <Dashboard dashboardContents={dashboardContents}
                           vendor={vendor}/>
              </MuiThemeProvider>
              , document.getElementById(vendor ? 'vendor-root'
                      : 'dashboard-root'))
    }
  }
  // get params from url path.
  const searchParams = new URLSearchParams(window.location.search)
  const projectName = searchParams.get('project_name')
  // send the request to the back end
  const request = JSON.stringify({
    name: projectName
  })
  xhr.open('post', './postDashboardContents')
  xhr.send(request)
}
