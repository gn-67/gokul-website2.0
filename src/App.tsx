import World from './components/World/World'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import { useNavStore } from './store/useNavStore'

export default function App() {
  const setLoadingComplete = useNavStore((s) => s.setLoadingComplete)

  return (
    <>
      <LoadingScreen onComplete={setLoadingComplete} />
      <World />
    </>
  )
}
