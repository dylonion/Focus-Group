import React from 'react'

import BizInfo from './BizInfo'
import BizForm from './BizForm'
import SearchUsers from './SearchUsers'
import CreateGroup from './CreateGroup'
import BizShowGroups from './BizShowGroups'

const query = {
  height:[false,false,false,false],
  weight:[false,false,false,false],
  income:[false,false,false,false],
  age:[false,false,false,false],
  zip: ''
}

class CorporatePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      bizDetails: {},
      apiDataLoaded: false,
      searchQuery: query,
      searchResults: {},
      searchResultsLoaded: false,
      bizUsers: {},
      bizUsersLoaded: false,
      searchResultsInvalid: null,
      newUser: {},
      groups: {},
      groupsLoaded: false,
      userInfo: {},
      userInfoLoaded: false,
      userDetailsShown: false
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.clearAll = this.clearAll.bind(this)
    this.userHandleInputChange = this.userHandleInputChange.bind(this)
    this.addToGroup = this.addToGroup.bind(this)
    this.removeFromGroup = this.removeFromGroup.bind(this)
    this.fetchGroups = this.fetchGroups.bind(this)
    this.deleteGroup = this.deleteGroup.bind(this)
    this.showUserDetails = this.showUserDetails.bind(this),
    this.hideUserDetails = this.hideUserDetails.bind(this)
  }

  componentDidMount() {
    fetch(`api/biz/${this.state.user.id}`)
    .then(res => res.json())
    .then(res => {
      if(res.biz.biz){
        this.setState({
          bizDetails: res.biz.biz,
          apiDataLoaded: true
        })
        console.log(res.biz)
      }
    })
    .then(this.fetchGroups())
  }

  hideUserDetails() {
    this.setState({
      userDetailsShown: false
    })
  }

  fetchGroups() {
      fetch(`api/groups/${this.state.user.id}`)
        .then(res => res.json())
        .then(res => {
          this.setState({
            groups: res.groups.groups,
            groupsLoaded: true
          })
        })
      .catch(err => console.log(err))
  }

  addToGroup(id, name) {
    console.log('biz_id: ',this.state.user.id)
    console.log('group_name: ',name)
    fetch(`/api/groups/${id}`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        biz_id: this.state.user.id,
        user_id: id,
        group_name: name
      })
    })
    .then(res => res.json())
    .then(res => {
      this.setState({
        groups: res.groups.groups,
        groupsLoaded: true
      })
    })
    .catch(err => console.log(err))
  }

  removeFromGroup(biz_id, user_id, group_name) {
    fetch(`/api/groups/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        biz_id: biz_id,
        user_id: user_id,
        group_name: group_name
      })
    })
    .then(res => res.json())
    .then(res => {
        this.setState({
          groups: res.groups.groups,
          groupsLoaded: true
        })
      })
    .catch(err => console.log(err))
  }

  userHandleInputChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    console.log('name: ', name)
    console.log('value: ', value)
    this.setState((prevState, props) => {
      return {
        newUser: Object.assign({}, prevState.newUser, {[name]: value})
      }
    })
  }

  handleInputChange(e, destination) {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const checkValue = e.target.value;
    if(destination === 'bizDetails'){
      this.setState((prevState,props) => {
        return {
          bizDetails: Object.assign({}, prevState.bizDetails, {[name]: value})
        }
      })
    }else{
      let filteredState
      if(name === 'zip'){
        filteredState = value
      }else{
        filteredState = this.state.searchQuery[name]
        filteredState[checkValue] = value
      }
      this.setState((prevState,props) => {
      return {
          searchQuery: Object.assign({}, prevState.searchQuery, {[name]: filteredState })
        }
      })
    }
  }

  clearAll(e) {
    e.preventDefault()
    console.log('clearall fired')
    this.setState({
      searchQuery: {
        height:[false,false,false,false],
        weight:[false,false,false,false],
        income:[false,false,false,false],
        age:[false,false,false,false],
        zip: ''
      }
    })
  }

  isValid(arr) {
    if(typeof(arr === 'string')){
       return arr !== ''
    }else{
      return arr.find((el) =>{
        return el === true
      })
    }
  }

  handleSubmit(e, destination) {
    e.preventDefault()
    let urel, data, method
    switch(destination) {
      case 'groups':
        urel= '/api/groups'
        data= this.state.newUser
        method='POST'
        break
      case 'bizDetails':
        urel = '/api/biz'
        data = this.state.bizDetails
        method = 'POST'
        break
      case 'searchUsers':
        urel = '/api/biz/search'
        let searchQuery = this.state.searchQuery
        let dataCheck = this.isValid([this.isValid(searchQuery.height),this.isValid(searchQuery.weight),this.isValid(searchQuery.income),this.isValid(searchQuery.age), this.isValid(searchQuery.zipCode)])
        data = dataCheck ? this.state.searchQuery : false
        method = 'POST'
        break
      case 'bizUsers':
        urel = '/api/groups'
        method = 'GET'
        break
      default:
        break;
    }
    if(data){
      fetch(urel, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : null
    })
    .then(res => res.json())
    .then(res => {
      switch(destination) {
        case 'groups':
          this.setState({
            groups: res.groups.groups,
            groupsLoaded: true
          })
          break
        case 'bizDetails':
          this.setState({
            bizDetails: res.biz.biz,
            apiDataLoaded: true
          })
          break
        case 'searchUsers':
          if(res.results&&res.results.filters&&res.results.filters.length){
            this.setState({
              searchResults: res.results.filters,
              searchResultsLoaded: true,
              searchQuery: query,
              searchResultsInvalid: null
            })
          }else{
            this.setState({
              searchResultsInvalid: '0 matches'
            })
          }
          break
        case 'bizUsers':
          this.setState({
            bizUsers: res.data,
            bizUsersLoaded: true
          })
          break
        default:
          break
      }
    })
    }else{
      console.log('Invalid/empty search')
      this.setState({
        searchResultsInvalid: 'Invalid/empty search'
      })
      return false
    }
  }

  deleteGroup(groupname) {
    fetch(`/api/groups/${groupname}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        biz_id: this.state.user.id
      })
    })
    .then(res => res.json())
    .then(res => {
      this.setState({
        groups: res.groups.groups,
        groupsLoaded: true
      })
    })
    .catch(err => console.log(err))
  }
  showUserDetails(user_id) {
    fetch(`/api/client/${user_id}`)
    .then(res => res.json())
    .then(res => {
      this.setState({
        userDetailsShown: true,
        userInfo: res.client.user,
        userInfoLoaded: true
      })
    })
  }

  render() {
    return (
      <div className="biz-page">
        <div className="business-left">
          {this.state.apiDataLoaded ?
            <div>
              <BizInfo
                user={this.state.user}
                bizDetails={this.state.bizDetails}
              />
              <BizShowGroups
                groups={this.state.groups}
                groupsLoaded={this.state.groupsLoaded}
                removeFromGroup={this.removeFromGroup}
                deleteGroup={this.deleteGroup}
                showUserDetails={this.showUserDetails}
                userInfo={this.state.userInfo}
                userInfoLoaded={this.state.userInfoLoaded}
                shown={this.state.userDetailsShown}
                hideUserDetails={this.hideUserDetails}
              />
              <CreateGroup
                newUser={this.state.newUser}
                handleSubmit={this.handleSubmit}
                userHandleInputChange={this.userHandleInputChange}
              />
            </div>
            :
            <BizForm
              handleSubmit={this.handleSubmit}
              handleInputChange={this.handleInputChange}
              bizDetails={this.state.bizDetails}
            />
          }
        </div>
        <div className="business-right">
          <SearchUsers
            groups={this.state.groups}
            groupsLoaded={this.state.groupsLoaded}
            searchQuery={this.state.searchQuery}
            searchResults={this.state.searchResults}
            searchResultsLoaded={this.state.searchResultsLoaded}
            handleInputChange={this.handleInputChange}
            handleSubmit={this.handleSubmit}
            clearAll={this.clearAll}
            searchResultsInvalid={this.state.searchResultsInvalid}
            addToGroup={this.addToGroup}
          />
        </div>
      </div>
    )
  }
}

export default CorporatePage
