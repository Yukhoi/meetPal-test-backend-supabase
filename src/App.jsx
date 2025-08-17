import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Test from './components/Test'
import './App.css'
import './components/Auth.css'
import './components/Test.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 获取当前会话状态
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="app-container">
      <div className="split-screen">
        <div className="left-side">
          {!session ? (
            <Auth />
          ) : (
            <div className="authenticated-content">
              <h1>欢迎回来！</h1>
              <p>您已登录为：{session.user.email}</p>
              <button onClick={() => supabase.auth.signOut()}>退出登录</button>
            </div>
          )}
        </div>
        <div className="right-side">
          <Test />
        </div>
      </div>
    </div>
  )
}

export default App
