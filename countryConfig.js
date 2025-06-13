// countryConfig.js
export const countryConfig = {
  NL: {
    countryCode: 'NL',
    longFormFields: ['straat', 'huisnummer', 'postcode', 'woonplaats', 'telefoon'],
    streetField: true,
    houseNumberField: true,
    cityField: 'woonplaats',
    validationMessages: {
      genderRequired: 'Geslacht invullen',
      firstnameRequired: 'Voornaam invullen',
      lastnameRequired: 'Achternaam invullen',
      dobRequired: 'Geboortedatum invullen',
      emailRequired: 'Geldig e-mailadres invullen',
      postcodeRequired: 'Postcode invullen',
      streetRequired: 'Straat invullen',
      houseNumberRequired: 'Huisnummer invullen',
      cityRequired: 'Woonplaats invullen',
      phoneRequired: 'Telefoonnummer invullen',
      phoneTooLong: 'Telefoonnummer mag max. 11 tekens bevatten',
    }
  },
  UK: {
    countryCode: 'UK',
    longFormFields: ['address', 'postcode', 'city', 'phone'],
    streetField: true, // = "address" field
    houseNumberField: false, // UK heeft dit meestal niet los
    cityField: 'city',
    validationMessages: {
      genderRequired: 'Please select gender',
      firstnameRequired: 'Please enter first name',
      lastnameRequired: 'Please enter last name',
      dobRequired: 'Please enter date of birth',
      emailRequired: 'Please enter valid email address',
      postcodeRequired: 'Please enter postcode',
      streetRequired: 'Please enter address',
      houseNumberRequired: 'Please enter house number',
      cityRequired: 'Please enter town/city',
      phoneRequired: 'Please enter phone number',
      phoneTooLong: 'Phone number max 11 digits',
    }
  }
};
