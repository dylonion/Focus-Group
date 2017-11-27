import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import './App.css';

//Custom Components
import Header from './components/Header' //Persistent navbar at top with options menu
import Jumbotron from './components/Jumbotron' //Hero image + login
import Footer from './components/Footer'
import ClientPage from './components/client/ClientPage'//Main page for client accounts
import CorporatePage from './components/corporate/CorporatePage'//Main page for corporate accounts

class App extends Component {
  constructor() {
    super()
    this.state ={
      auth: false,
      user: null,
      apiError: null,

    }
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this)
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this)
    this.logout = this.logout.bind(this)
    this.deleteAccount = this.deleteAccount.bind(this)
  }

  logout() {
    fetch('/api/auth/logout', {
      credentials: 'include',
    }).then(res => res.json())
      .then(res => {
        this.setState({
          auth: res.auth
        })
      }).catch(err => console.log(err));
  }

  handleLoginSubmit(e, data) {
    e.preventDefault();
    this.setState({
      apiError: null
    })
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(res => {
          if(res.auth){
            this.setState({
              auth: res.auth,
              user: res.data.user
            })
          }else{
            this.setState({
              apiError: 'User not found'
            })
          }
      }).catch(err => console.log(err));
  }

  deleteAccount() {
    let confirmDelete = window.prompt('Are you sure you want to delete this account? Type your username to confirm.')
    if(confirmDelete&& confirmDelete === this.state.user.username){
      fetch('/api/auth/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:'include'
      })
      .then(res => res.json())
      .then(res => {
        this.setState({
          auth: res.auth,
          user: res.data.user
        })
      })
    }
  }

  handleRegisterSubmit(e, data) {
    e.preventDefault();
    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
      .then(res => {
        console.log(res);
        if(res.error){
          if(res.error.code === 23505){
            this.setState({
              apiError: 'Error: Username already exists.'
            })
          }
        }else{
          this.setState({
            auth: res.auth,
            user: res.data.user
          })
        }
    }).catch(err => console.log(err))
  }

  render() {
    return (
      <Router>
        <div className="App">
        <Route path='/' render={(props) => {
          return (
            <Header
              logout={this.logout}
              deleteAccount={this.deleteAccount}
            />
          )
        }} />
        <Route exact path='/' render={(props) => {
            return (
              this.state.auth ?
              this.state.user.company ?
              <Redirect push to='/corporate' /> :
              <Redirect push to='/client' /> :
              <div>
                <Jumbotron
                  handleLoginSubmit={this.handleLoginSubmit}
                  handleRegisterSubmit={this.handleRegisterSubmit}
                  apiError={this.state.apiError}
                />
              </div>
            )
          }}
        />
        <Route exact path='/client' render={(props) => {
          return (
            this.state.auth && !this.state.user.company ?
            <ClientPage user={this.state.user} /> :
            <Redirect push to="/" />
          )
        }} />
        <Route exact path='/corporate' render={(props) => {
          return (
            this.state.auth && this.state.user.company ?
            <CorporatePage user={this.state.user}/> :
            <Redirect push to="/" />
          )
        }} />
        <Route path='/' component={Footer} />
        </div>
      </Router>
    );
  }
}

export default App;
