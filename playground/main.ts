import { useAppConfig } from 'vite-plugin-extra-app-config/helper'
import './style.css'

const config = useAppConfig<Record<string, string>>(import.meta.env, import.meta.env.PROD, '__APP_ENV__')
const app = document.getElementById('app')!
const heading = document.createElement('h1')
const mode = document.createElement('p')
const output = document.createElement('pre')

heading.textContent = 'Runtime configuration'
mode.textContent = import.meta.env.MODE
output.textContent = JSON.stringify(config, null, 2)
app.replaceChildren(heading, mode, output)

console.log('Env Config:', config)
