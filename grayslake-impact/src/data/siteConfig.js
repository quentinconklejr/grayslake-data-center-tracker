export const SITE_TITLE = 'Grayslake Data Center Tracker'

export const LAST_VERIFIED = 'Aug 10, 2026'

// Email updates. The signup on the homepage always shows a normal email box
// and a Subscribe button. It needs one credential to actually deliver, and
// until it has one, submitting says so rather than pretending it worked.
export const NEWSLETTER = {
  // Paste the access key Web3Forms emails you. That is the whole setup:
  // web3forms.com, type the address where submissions should land, they send a
  // key, put it here. No account to create.
  web3formsKey: 'b59937db-71ed-41f0-9592-a26078230676',

  // Alternative if you would rather use Formspree: create a form and take the
  // id out of its endpoint URL. Only one of these needs a value.
  formspreeId: null,
}

export const SITE_CONTACT = {
  email: 'qconkle2@illinois.edu',
  phone: '224-330-9078',
  phoneTel: '+12243309078',
}
