import { memo } from 'react'

function SortDefault(props: React.SVGAttributes<SVGElement>): React.JSX.Element {
  return (
    <svg
      className="sorting-handler sort-default"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="3252"
      width="160"
      height="160"
      {...props}
    >
      <path
        d="M547.5 102.433l226.1 258.4c17.1 19.6 15.2 49.4-4.4 66.5-8.6 7.5-19.6 11.7-31 11.7H285.9c-26 0-47.1-21.1-47.1-47.1 0-11.4 4.1-22.5 11.7-31l226-258.5c17.1-19.6 46.9-21.6 66.5-4.4 1.6 1.3 3.1 2.8 4.5 4.4zM547.5 921.567l226.1-258.4c17.1-19.6 15.2-49.4-4.4-66.5-8.6-7.5-19.6-11.7-31-11.7H285.9c-26 0-47.1 21.1-47.1 47.1 0 11.4 4.1 22.5 11.7 31l226.1 258.4c17.1 19.6 46.9 21.6 66.5 4.4 1.5-1.2 3-2.7 4.4-4.3z"
        fill="#DBDBDB"
        p-id="3253"
      ></path>
    </svg>
  )
}

function SortAsc(props: React.SVGAttributes<SVGElement>): React.JSX.Element {
  return (
    <svg
      className="sorting-handler sort-asc"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="3412"
      width="160"
      height="160"
      {...props}
    >
      <path
        d="M547.5 102.433l226.1 258.4c17.1 19.6 15.2 49.4-4.4 66.5-8.6 7.5-19.6 11.7-31 11.7H285.9c-26 0-47.1-21.1-47.1-47.1 0-11.4 4.1-22.5 11.7-31l226-258.5c17.1-19.6 46.9-21.6 66.5-4.4 1.6 1.3 3.1 2.8 4.5 4.4z"
        fill="#515151"
        p-id="3413"
      ></path>
      <path
        d="M547.5 921.567l226.1-258.4c17.1-19.6 15.2-49.4-4.4-66.5-8.6-7.5-19.6-11.7-31-11.7H285.9c-26 0-47.1 21.1-47.1 47.1 0 11.4 4.1 22.5 11.7 31l226.1 258.4c17.1 19.6 46.9 21.6 66.5 4.4 1.5-1.2 3-2.7 4.4-4.3z"
        fill="#DBDBDB"
        p-id="3414"
      ></path>
    </svg>
  )
}

function SortDesc(props: React.SVGAttributes<SVGElement>): React.JSX.Element {
  return (
    <svg
      className="sorting-handler sort-desc"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="3573"
      width="160"
      height="160"
      {...props}
    >
      <path
        d="M547.5 102.433l226.1 258.4c17.1 19.6 15.2 49.4-4.4 66.5-8.6 7.5-19.6 11.7-31 11.7H285.9c-26 0-47.1-21.1-47.1-47.1 0-11.4 4.1-22.5 11.7-31l226-258.5c17.1-19.6 46.9-21.6 66.5-4.4 1.6 1.3 3.1 2.8 4.5 4.4z"
        fill="#DBDBDB"
        p-id="3574"
      ></path>
      <path
        d="M547.5 921.567l226.1-258.4c17.1-19.6 15.2-49.4-4.4-66.5-8.6-7.5-19.6-11.7-31-11.7H285.9c-26 0-47.1 21.1-47.1 47.1 0 11.4 4.1 22.5 11.7 31l226.1 258.4c17.1 19.6 46.9 21.6 66.5 4.4 1.5-1.2 3-2.7 4.4-4.3z"
        fill="#515151"
        p-id="3575"
      ></path>
    </svg>
  )
}

interface SortingHandlerProps extends React.SVGAttributes<SVGElement> {
  sort: 'asc' | 'desc' | false | undefined | null
}

function SortingHandler({ sort, ...props }: SortingHandlerProps) {
  switch (sort) {
    case 'asc':
      return <SortAsc {...props} />
    case 'desc':
      return <SortDesc {...props} />
    default:
      return <SortDefault {...props} />
  }
}

export default memo(SortingHandler)
