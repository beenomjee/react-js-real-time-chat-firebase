import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorPage, Home, Login } from './modules'
import { ProtectedRoute } from './components'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<ProtectedRoute element={Home} />} />
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </div>
  )
}

export default App