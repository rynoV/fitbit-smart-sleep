import { me as appbit } from 'appbit'
import { today } from 'user-activity'

console.log('HELLOx2')

if (appbit.permissions.granted('access_activity')) {
  console.log(`${today.adjusted.steps} Steps`)
  if (today.local.elevationGain !== undefined) {
    console.log(`${today.adjusted.elevationGain} Floor(s)`)
  }
} else {
  console.log('No permission')
}
