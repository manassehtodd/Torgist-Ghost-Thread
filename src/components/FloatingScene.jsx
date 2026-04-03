import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, useGLTF } from '@react-three/drei'
import { Box3, MathUtils, Vector3 } from 'three'

const sizeVector = new Vector3()

function prepareModel(scene) {
  const model = scene.clone()

  model.traverse((child) => {
    if (child.isCamera || child.isLight) {
      child.visible = false
      return
    }

    if (!child.isMesh) {
      return
    }

    child.castShadow = false
    child.receiveShadow = false
    child.frustumCulled = true

    const bounds = new Box3().setFromObject(child)
    bounds.getSize(sizeVector)

    const largestSide = Math.max(sizeVector.x, sizeVector.y, sizeVector.z)

    if (largestSide > 12) {
      child.visible = false
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material]

    materials.forEach((material) => {
      if (!material) {
        return
      }

      material.transparent = true
      material.opacity = Math.min(material.opacity ?? 1, 1)

      if ('toneMapped' in material) {
        material.toneMapped = true
      }
    })
  })

  return model
}

function FloatingModel({ url, basePosition, baseRotation, scale, pointerRef, floatSpeed = 1.8 }) {
  const groupRef = useRef(null)
  const { scene } = useGLTF(url)
  const model = useMemo(() => prepareModel(scene), [scene])

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return
    }

    const pointerX = pointerRef.current.x
    const pointerY = pointerRef.current.y
    const time = state.clock.getElapsedTime()
    const drift = Math.sin(time * 0.7 + basePosition[0]) * 0.12

    groupRef.current.position.x += (
      basePosition[0] + pointerX * 0.55 + drift - groupRef.current.position.x
    ) * Math.min(1, delta * 2.8)
    groupRef.current.position.y += (
      basePosition[1] + pointerY * 0.35 - drift * 0.4 - groupRef.current.position.y
    ) * Math.min(1, delta * 2.8)

    groupRef.current.rotation.x += (
      baseRotation[0] + pointerY * 0.18 - groupRef.current.rotation.x
    ) * Math.min(1, delta * 2.6)
    groupRef.current.rotation.y += (
      baseRotation[1] + pointerX * 0.28 - groupRef.current.rotation.y
    ) * Math.min(1, delta * 2.6)
    groupRef.current.rotation.z += (
      baseRotation[2] + pointerX * 0.08 - groupRef.current.rotation.z
    ) * Math.min(1, delta * 2.2)
  })

  return (
    <Float speed={floatSpeed} rotationIntensity={0.25} floatIntensity={0.5}>
      <group ref={groupRef} position={basePosition} rotation={baseRotation} scale={scale}>
        <primitive object={model} />
      </group>
    </Float>
  )
}

const MODELS = [
  {
    url: new URL('../assets/images/3D_ghost.glb', import.meta.url).href,
    basePosition: [2.75, -0.02, 0.2],
    baseRotation: [0.15, 1.64, 0.12],
    scale: 0.42,
    floatSpeed: 1.9,
  },
  {
    url: new URL('../assets/images/stail_face.glb', import.meta.url).href,
    basePosition: [-2.7, -0.28, -0.2],
    baseRotation: [0.18, 4.62, -0.22],
    scale: 0.4,
    floatSpeed: 1.7,
  },
]

MODELS.forEach((model) => {
  useGLTF.preload(model.url)
})

function SceneContent() {
  const pointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const updatePointer = (event) => {
      pointerRef.current.x = ((event.clientX / window.innerWidth) - 0.5) * 2
      pointerRef.current.y = -((event.clientY / window.innerHeight) - 0.5) * 2
    }

    const resetPointer = () => {
      pointerRef.current.x = 0
      pointerRef.current.y = 0
    }

    window.addEventListener('pointermove', updatePointer)
    window.addEventListener('pointerleave', resetPointer)

    return () => {
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('pointerleave', resetPointer)
    }
  }, [])

  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 6, 6]} intensity={2.4} color="#fff3e6" />
      <directionalLight position={[-6, -3, 4]} intensity={1.2} color="#7dd3fc" />
      <spotLight position={[0, 3, 8]} angle={0.35} penumbra={1} intensity={1.7} color="#f5d0fe" />
      <Environment preset="city" />

      {MODELS.map((model) => (
        <FloatingModel
          key={model.url}
          url={model.url}
          basePosition={model.basePosition}
          baseRotation={model.baseRotation}
          scale={model.scale}
          floatSpeed={model.floatSpeed}
          pointerRef={pointerRef}
        />
      ))}
    </>
  )
}

export default function FloatingScene() {
  return (
    <div className="floating-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9.2], fov: 30 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#000000', 0)
          gl.domElement.style.background = 'transparent'
          scene.background = null
          scene.backgroundBlurriness = 0
          scene.backgroundIntensity = 0
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
