#!/usr/bin/env node
import fs from 'fs'
import VCardModule from '../dist/esm/index.js'

const VCard = VCardModule.default

// sample image
const imagePath = './lib/assets/sample.jpg'

// read image (base64 enconded)
const image = fs.readFileSync(imagePath, { encoding: 'base64', flag: 'r' })

// define vCard
const vCard = new VCard()

// define variables
const lastname = 'Desloovere'
const firstname = 'Jeroen'
const additional = ''
const prefix = ''
const suffix = ''

vCard
  // add personal data
  .addName(lastname, firstname, additional, prefix, suffix)
  .addNickname('Jero')
  // add work data
  .addCompany('Siesqo')
  .addJobtitle('Web Developer')
  .addRole('Data Protection Officer')
  .addEmail('info@jeroendesloovere.be')
  .addPhoneNumber(1234121212, 'PREF;WORK')
  .addPhoneNumber(123456789, 'WORK')
  .addAddress(
    'name',
    'extended',
    'street',
    'worktown',
    'state',
    'workpostcode',
    'Belgium',
  )
  .addSocial('https://twitter.com/twitteruser', 'Twitter', 'twitteruser')
  .addSocial('http://www.facebook.com/facebookuser', 'Facebook', 'facebookuser')
  .addSocial('http://www.flickr.com/photos/flickruser', 'Flickr', 'flickruser')
  .addSocial(
    'http://www.linkedin.com/in/linkedinuser',
    'LinkedIn',
    'linkedinuser',
  )
  .addSocial('http://www.custom.social/customuser', 'Custom', 'customuser')
  .addURL('http://www.jeroendesloovere.be')
  .addPhoto(image, 'JPEG')

console.log(vCard.toString())
