# **TinyApp**

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (like TinyURL).

## Final Product

!["Login Page"](https://github.com/xynyx/tinyapp/blob/master/docs/login_page.png)
!["Link List Page"](https://github.com/xynyx/tinyapp/blob/master/docs/urls_page.png)
!["Specific Link Page"](https://github.com/xynyx/tinyapp/blob/master/docs/link_page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Additional Features

- Each unique link page displays:
  - Total visits
  - Unique visits
  - Dynamic table with each visitor & timestamp of when they accessed the link

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.