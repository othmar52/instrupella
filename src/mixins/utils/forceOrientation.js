export default () => {
  // this only works on mobile chrome in fullscreen mode
  const forceOrientation = (orientation) => {
    if (self.isMobile && screen.orientation && screen.orientation.lock) {
      screen.orientation
        .lock(orientation)
        .catch(function screenLockError(e) {
          console.warn(e)
        })
    }
  }
  return {
    forceOrientation
  }
}
