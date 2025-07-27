import { LoginForm } from '@renderer/components/LoginForm'
import { ReactElement } from 'react'

export default function SignInPage(): ReactElement {
  return (
    <div className="rerit-gradient dot-pattern flex h-screen w-screen flex-col gap-4 p-6 md:p-10 app-background">
      <div className="z-10 flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
