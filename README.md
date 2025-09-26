**Note:** In order to see pages, in `App.jsx` the user will have to uncomment the pages inside the `<div>` section.  
*Caution:* only one page can be uncommented at a time.

```jsx
export default function App() {
  return (
    <div>
      {/* <Calendar /> */}
      {/* <Notifications /> */}
      {/* <Registration /> */}
      {/* <MatchMaking /> */}
      {/* <Login /> */} 
      {/* <UserProfiles /> */}
      <HomePage /> 
    </div>
  );
}
