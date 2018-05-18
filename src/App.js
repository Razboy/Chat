import React, { Component } from 'react';

import io from 'socket.io-client';
import {StyleSheet, css} from 'aphrodite';
import './reset.css';

const socket = io('http://dev.bidon-tech.com:65058/');

class App extends Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            nickname: '',
            online: [],
            login: false,
            mess: '',
            name: '',
            history: []
        }
    }

    componentDidMount() {
      socket.on('connect', () => {
          console.log('Connected to server')

          // История сообщений
          socket.on('history', history => {
              this.setState({history:history})
          })

          // список пользователей онлайн
          socket.on('online', list => {
              this.setState({online: list})
          })

          // никнейм присоединившегося пользователя
          socket.on('connected', nickname => {
              let mess = this.state.history
              let user = {nickname: "User " + nickname + " connected"}
              mess.push(user)
              this.setState({history: mess})
          })

          // никнейм отсоеденившегося пользователя
          socket.on('disconnected', nickname => {
              let mess = this.state.history
              let user = {nickname: "User " + nickname + " disconnected"}
              mess.push(user)
              this.setState({history: mess})
          })

          // сообщение от пользователя
          socket.on('message', message => {
              let mess = this.state.history
              mess.push(message)
              this.setState({history: mess})
              document.getElementById('mes').scroll(0, document.getElementById('mes').scrollHeight);
          })
      })
    }

    login(e) {
      e.preventDefault();
      if (this.state.nickname === '') {
          alert("Enter a name!")
      } else {
          let nickname = this.state.nickname;
          socket.emit('nickname', nickname, () => {
              this.setState({login: true})
          })
      }
    }

    send(e) {
      e.preventDefault();
      if (this.state.mess === '') {
          alert("Enter a message!")
      } else {
          let mess = this.state.mess;
          socket.emit('message', mess)
          this.setState({mess: ""})
      }
    }

    render() {
        let history = this.state.history.slice(this.state.history.length-20, this.state.history.length);
        let filter = this.state.history == null?(this.state.mess):history
        let online = this.state.online.map((value, index) => {
            return (
                <li className={css(style.onlinelist)} key={index}><img alt="" width="40" src={require("./img/image.jpg")}/><p>{value}</p></li>
            )
        })
        let mess = filter.map((value, index) => {
            return (
                <li className={css(style.mess)} key={index}><span className={css(style.nickname)}>{value.nickname}</span> <span  className={css(style.messText)} >{value.message}</span>
                    <div className={css(style.time)}><p className={css(style.time)}>{value.date}</p></div>
                </li>
            )
        });
        if (this.state.login === true) {
            setTimeout(() => this.setState({hi: "Your nickname: "}), 3000)
        }
        return (
            <div className="App">
                <div className={css(style.header)}>
                    <h1>Чатик з Друзяшками</h1>
                </div>
                <form className={this.state.login === false ? css(style.form) : css(style.offline)}>
                    <h3>
                        Registration
                    </h3>
                    <input 
                        id="nickname"
                        type="text" 
                        placeholder="Enter your nickname"
                        value={this.state.nickname}
                        required
                        onChange={(e) => this.setState({nickname: e.target.value})}
                    />
                    <button onClick={this.login.bind(this)}>
                        Create new coinflip
                    </button>
                </form>

                <form className={this.state.login == true ? css(style.chat) : css(style.offline)}>
                    <ul id="mes" className={css(style.message)}>
                        {mess}
                    </ul>
                    <input
                        id="message" 
                        type="text"
                        onChange={(e) => this.setState({mess: e.target.value})}
                        placeholder="Write message"
                    />
                    <button onClick={this.send.bind(this)}>
                        Send
                    </button>
                    <label>User(s) online:</label>
                    <ul className={css(style.userlist)}>
                        {online}
                    </ul>
                </form>

            </div>
        );
    }
}

const style = StyleSheet.create({
    header: {
        margin: 0,
        textAlign: 'center',
        backgroundColor: '#222',
        color: '#fff',
        padding: 5,
        ':nth-child(1n) > h1': {
          fontFamily: 'Open Sans Condensed',
          fontSize: 36
        }
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'center',
        margin: '20px auto',
        padding: '0 30px 30px 30px',
        backgroundColor: '#444',
        borderRadius: 3,
        width: 400,
        ':nth-child(1n) > h3': {
            fontFamily: 'Open Sans Condensed',
            fontSize: 28,
            color: '#fff'
        },
        ':nth-child(1n) > input': {
            marginBottom: 20
        }
    },
    chat: {
        display: 'flex',
        flexDirection: 'column',
        width: 1000,
        height: 520,
        margin: '10px auto',
        padding: '10px 20px',
        backgroundColor: '#444',
        color: '#fff',
        ':nth-child(1n) > ul': {
            listStyle: 'none',
            borderTop: '1px solid #333',
            paddingBottom: 10
        },
        ':nth-child(1n) > button': {
            margin: '10px auto',
            width: 100
        }
    },
    offline: {
        display: 'none'
    },
    message: {
        overflowY: 'auto',
        overflowX: 'none',
        margin: '20px auto',
        textAlign: 'center',
        width: '100%',
        padding: 0,
        ':nth-child(1n) > li': {
            display: 'flex',
            justifyContent: 'space-between',
            listStyle: 'none'
        }
    },
    mess: {
        fontFamily: 'Open Sans Condensed',
        fontSize: 20,
        width: '100%',
        margin: '0 5px',
        wordWrap: 'break-word',
        borderTop: '1px solid #666'
    },
    userlist: {
        display: 'flex',
        flexDirection: 'row',
        paddingBottom: 0,
        textAlign: 'center'
    },
    onlinelist: {
        margin: '5px auto'
    },
    nickname: {
        display: 'block',
        padding: '0 2px',
        backgroundColor: 'blue',
        borderRadius: 3,
        height: 32
    }
})

export default App;




