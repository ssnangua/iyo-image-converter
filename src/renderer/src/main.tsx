import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@ant-design/v5-patch-for-react-19'
import App from './App'

document.title = '哎哟图片转换器'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// setTimeout(() => console.clear(), 10)
