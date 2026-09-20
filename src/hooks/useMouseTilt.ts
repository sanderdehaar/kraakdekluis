import { useEffect } from 'react'
import type { RefObject } from 'react'

function useMouseTilt(
  ref: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const tv = ref.current

      if (!tv) return

      tv.style.setProperty(
        '--rotate-x',
        `${(e.clientY / window.innerHeight - 0.5) * -6}deg`
      )

      tv.style.setProperty(
        '--rotate-y',
        `${(e.clientX / window.innerWidth - 0.5) * 6}deg`
      )
    }

    const reset = () => {
      const tv = ref.current

      if (!tv) return

      tv.style.setProperty('--rotate-x', '0deg')
      tv.style.setProperty('--rotate-y', '0deg')
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseleave', reset)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseleave', reset)
    }
  }, [ref])
}

export default useMouseTilt