FEATURE:
User session management and user login using Supabase, with a Python backend and a React frontend. This will involve creating a secure authentication flow where users can sign up, log in, and log out. The backend will handle token verification for protected routes.

EXAMPLES:
Since there is no `examples/` folder, here is a description of the intended user flow:

1.  **Sign-up/Login:** A user visits the React application and is presented with a login/sign-up form. They can enter their credentials (email/password) or use a social login provider.
2.  **Authentication:** The React frontend communicates with Supabase Auth to authenticate the user.
3.  **Token Handling:** Upon successful authentication, Supabase returns a JSON Web Token (JWT). This token will be securely stored on the client side.
4.  **Authenticated Requests:** For any requests to protected endpoints on the Python (FastAPI) backend, the JWT is included in the `Authorization` header.
5.  **Backend Verification:** A middleware on the backend will intercept incoming requests, extract the JWT, and verify it with Supabase to ensure its authenticity and validity.
6.  **Logout:** The user can log out, which will clear the stored JWT from the client, effectively ending the session.

DOCUMENTATION:

- **Supabase Auth:**
  - JavaScript Client Library (`@supabase/supabase-js`): [https://supabase.com/docs/reference/javascript/auth-signup](https://supabase.com/docs/reference/javascript/auth-signup)
  - Python Client Library (`supabase-py`): [https://supabase.com/docs/reference/python/auth-signup](https://supabase.com/docs/reference/python/auth-signup)
  - JWT Verification: [https://supabase.com/docs/guides/auth/server-side/verifying-jwt](httpss://supabase.com/docs/guides/auth/server-side/verifying-jwt)
- **FastAPI:**
  - Middleware: [https://fastapi.tiangolo.com/tutorial/middleware/](https://fastapi.tiangolo.com/tutorial/middleware/)
  - Dependencies with `yield`: [https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/)
- **React:**
  - Handling Events: [https://react.dev/learn/responding-to-events](https://react.dev/learn/responding-to-events)
  - Context API for managing auth state: [https://react.dev/learn/passing-data-deeply-with-context](https://react.dev/learn/passing-data-deeply-with-context)

OTHER CONSIDERATIONS:

- **Security:** The JWT should be stored securely on the client. HttpOnly cookies are preferable to local storage to mitigate XSS risks.
- **Configuration:** The Python backend will require the Supabase URL and `anon` key to be stored as environment variables for token verification.
- **Error Handling:** Implement comprehensive error handling for scenarios like invalid credentials, network issues, or expired tokens.
- **User Experience:** Provide clear feedback to the user during login, logout, and in case of errors.
- **Password Management:** Include a password reset/recovery feature.
- **Data Synchronization:** The application's local database should reference users via their Supabase user ID to maintain data integrity.
- **Conversation History**: User conversations will be stored in a `conversation` table, linked to their user ID, to maintain and distinguish between user conversation histories.
