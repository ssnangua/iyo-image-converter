import { CustomScroll } from '@pikabobalex/react-custom-scroll'

class ScrollBar extends CustomScroll {
  #onResize: () => void

  constructor(props) {
    super(props)
    this.#onResize = (() => this.forceUpdate()).bind(this)
  }

  componentDidMount() {
    super.componentDidMount()
    window.addEventListener('resize', this.#onResize)
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    window.removeEventListener('resize', this.#onResize)
  }
}

export default ScrollBar
