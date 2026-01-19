import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <section>
    <div>{children}</div>
    </section>
  )
}

export default layout