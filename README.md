# Cortana Shopping Experience ChatBot

###### _(Currently only implemented over console)_

### Planned Features

- Ability for user to order products
- Ability for user to check products inventory.
- ChatBot asking/confirming a shipping address (123 Main Street, Seattle, WA, 99999)
- ChatBot asking for Contact Info (e.g. first name, last name, phone, email)
- Email confirmation

Currently accessible through using the console. To use, clone project and enter the project folder. Then run npm install in your command line, followed with node initial_bot.js.

### Current Progress:

__2017/2/4:__
- Focusing on 2 primary dialogs: _BuyItem_ and _ContactInfo_
- Adding functionality to ContactInfo, to allow user to confirm if current session stored contact info is correct
- If the user is not satisfied, they will have the ability to alter their contact information

Primary issues have been reworking the logic to handle cases of:

1. User's email exists but their phone doesn't
2. User's phone exists, but their email doesn't
3. User's email and phone exists
4. User's email exists, their phone doesn't, and they want to change their email
5. User's email and phone exists, but they want to change their email etc..

##### Legal Stuff:

[using Microsoft Cognitive Services](http://go.microsoft.com/fwlink/?LinkID=829046)

Privacy Policy:
Our _Cortana Shopping Experience ChatBot_ is enabled by Microsoft Bot Framework. The Microsoft Bot Framework is a set of web-services that enable intelligent services and connections using conversation channels you authorize. As a service provider, Microsoft will transmit content you provide to our bot/service in order to enable the service. For more information about Microsoft privacy policies please see their privacy statement here: http://go.microsoft.com/fwlink/?LinkId=521839. In addition, your interactions with this bot/service are also subject to the conversational channel's applicable terms of use, privacy and data collection policies. To report abuse when using a bot that uses the Microsoft Bot Framework to Microsoft, please visit the Microsoft Bot Framework website at https://www.botframework.com and use the “Report Abuse” link in the menu to contact Microsoft.

_Cortana Shopping Experience ChatBot_ uses Microsoft Cognitive Services. Microsoft will receive certain data from _Cortana Shopping Experience ChatBot_ to provide and improve its products. To report abuse of the Microsoft Cognitive Services to Microsoft, please visit the Microsoft Cognitive Services website at https://www.microsoft.com/cognitive-services, and use the “Report Abuse” link at the bottom of the page. For more information refer to the Microsoft Privacy Statement here: https://go.microsoft.com/fwlink/?LinkId=521839.
