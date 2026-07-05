import World from './components/World/World'
import OceanBackground from './components/OceanBackground/OceanBackground'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import { useNavStore } from './store/useNavStore'

export default function App() {
  const setLoadingComplete = useNavStore((s) => s.setLoadingComplete)

  return (
    <>
      <OceanBackground />
      <World />
      <LoadingScreen onComplete={setLoadingComplete} />
    </>
  )
}
