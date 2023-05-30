export const INFO_ERROR = 'error'
export const INFO_DEFAULT = 'info'
export const INFO_WARNING = 'warning'
export const INFO_SUCCESS = 'success'
export type infoType = typeof INFO_ERROR | typeof INFO_DEFAULT | typeof INFO_SUCCESS | typeof INFO_WARNING

export const getIconForInfoTyType = (typeOfInfo: infoType) => {
  switch (typeOfInfo) {
    case INFO_ERROR:
      return 'error-triangle'
    case INFO_SUCCESS:
      return 'success-ok'
    case INFO_DEFAULT:
      return 'info'
    case INFO_WARNING:
      return 'error-triangle'
  }
}
