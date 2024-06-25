import { ComponentType, PropsWithChildren, ReactElement } from "react"

type ProviderWithProps<P = {}> = [ComponentType<P>, P?]

export const buildProvidersTree = <P extends {}>(
  componentWithProps: ProviderWithProps<P>[]
): React.FC<PropsWithChildren> => {
  // initial component
  const initialComponent: React.FC<PropsWithChildren> = ({ children }) => (
    <>{children}</>
  )

  return componentWithProps.reduce(
    (AccumulatedComponents, [Provider, props = {} as P]) => {
      // eslint-disable-next-line react/display-name
      return ({ children }: PropsWithChildren): ReactElement => (
        <AccumulatedComponents>
          <Provider {...(props as P)}>{children}</Provider>
        </AccumulatedComponents>
      )
    },
    initialComponent
  )
}
