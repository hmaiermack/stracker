import React, { SetStateAction, useEffect } from 'react'

const Pagination = ({count, setOffset, offset}: {count: number, setOffset: React.Dispatch<SetStateAction<number>>, offset: number}) => {
    
    const pagesCount = Math.ceil(count / 10); 
  return (
    <div> {pagesCount} {offset} <button onClick={() => setOffset(offset += 10)}>Increase offset</button></div>
  )
}

export default Pagination