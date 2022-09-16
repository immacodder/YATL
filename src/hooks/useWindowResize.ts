import { debounce } from 'lodash'
import { useEffect, useState } from "react"

export function useWindowResize() {
  const [height, setHeight] = useState(window.innerHeight)
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const debounced = debounce(setDimentions, 50)
    function setDimentions() {
      setHeight(innerHeight)
      setWidth(innerWidth)
    }

    addEventListener("resize", debounced)
    return () => removeEventListener("resize", debounced)
  }, [])

  return { width, height }
}