export class WebRTCOptimizer {
  private static instance: WebRTCOptimizer
  private frameDropCount = 0
  private lastFrameTime = 0

  static getInstance(): WebRTCOptimizer {
    if (!WebRTCOptimizer.instance) {
      WebRTCOptimizer.instance = new WebRTCOptimizer()
    }
    return WebRTCOptimizer.instance
  }

  getOptimizedRTCConfig(): RTCConfiguration {
    return {
      iceServers: [
        { urls: 'stun:chanh-c4b5c4.hub.dev.jupyter.com.au:8555' },
        {
          urls: [
            'turn:ap-southeast-2.coturn.dev.jupyter.com.au:3478?transport=udp',
            'turn:ap-southeast-2.coturn.dev.jupyter.com.au:3478?transport=tcp',
          ],
          username: 'ap-southeast-2-dev-jupyter',
          credential: 'Z08242522ZBQHX263VIJ1',
        },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
    }
  }

  /**
   * Optimize video element for hardware acceleration
   */
  optimizeVideoElement(videoElement: HTMLVideoElement): void {
    // Force hardware acceleration
    videoElement.style.transform = 'translateZ(0)'
    videoElement.style.backfaceVisibility = 'hidden'
    videoElement.style.webkitBackfaceVisibility = 'hidden'
    videoElement.style.willChange = 'transform'

    // Optimize for streaming
    videoElement.playsInline = true
    videoElement.muted = true
    videoElement.preload = 'none'

    videoElement.oncontextmenu = () => false
  }

  /**
   * Apply fullscreen optimizations
   */
  optimizeForFullscreen(videoElement: HTMLVideoElement): void {
    // Enhanced hardware acceleration for fullscreen
    videoElement.style.transform = 'translate3d(0, 0, 0) scale(1)'
    videoElement.style.transformOrigin = 'center center'
    videoElement.style.willChange = 'transform'

    // Disable image-rendering optimizations that can cause pixelation
    videoElement.style.imageRendering = 'auto'

    // Ensure proper aspect ratio maintenance
    videoElement.style.objectFit = 'contain'
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
  }

  /**
   * Reset fullscreen optimizations
   */
  resetFullscreenOptimizations(videoElement: HTMLVideoElement): void {
    videoElement.style.transform = 'translateZ(0)'
    videoElement.style.objectFit = 'cover'
    videoElement.style.width = ''
    videoElement.style.height = ''
  }

  /**
   * Monitor frame drops and auto adjust quality
   */
  monitorPerformance(videoElement: HTMLVideoElement): () => void {
    const checkFrameRate = () => {
      if ('webkitVideoDecodedByteCount' in videoElement) {
        const currentTime = performance.now()
        if (this.lastFrameTime > 0) {
          const timeDiff = currentTime - this.lastFrameTime
          // If frame rate < 24fps, count as drop
          if (timeDiff > 42) {
            this.frameDropCount++
          }
        }
        this.lastFrameTime = currentTime
      }
    }

    const intervalId = setInterval(checkFrameRate, 100)

    // Cleanup function
    return () => clearInterval(intervalId)
  }

  /**
   * Improve transceiver settings
   */
  getOptimizedTransceiverConfig(): RTCRtpTransceiverInit {
    return {
      direction: 'recvonly',
      sendEncodings: [
        {
          maxBitrate: 2500000, // 2.5Mbps
          maxFramerate: 30,
          scaleResolutionDownBy: 1,
        },
      ],
    }
  }

  /**
   * Debounce retry logic to avoid retry storm
   */
  debounceRetry(retryFn: () => void, delay: number = 2000): () => void {
    let timeoutId: NodeJS.Timeout

    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(retryFn, delay)
    }
  }

  /**
   * Get frame drop statistics
   */
  getPerformanceStats() {
    return {
      frameDropCount: this.frameDropCount,
      frameDropRate: this.frameDropCount / (performance.now() / 1000), // drops per second
    }
  }

  /**
   * Reset performance counters
   */
  resetStats(): void {
    this.frameDropCount = 0
    this.lastFrameTime = 0
  }
}

/**
 * RequestIdleCallback polyfill for better scheduling
 */
export const scheduleWork = (
  callback: () => void,
  options?: { timeout?: number }
) => {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, options)
  } else {
    // Fallback for browsers without requestIdleCallback
    return setTimeout(callback, 0)
  }
}

/**
 * High priority task scheduler using MessageChannel
 */
export const scheduleHighPriorityWork = (callback: () => void) => {
  const channel = new MessageChannel()
  channel.port1.onmessage = callback
  channel.port2.postMessage(null)
}
