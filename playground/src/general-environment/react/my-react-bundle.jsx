import './my-react-button.pcss';
import './my-react-container.pcss';

/**
 * Some random AI generated react code.
 */
const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="container">
      <h1>Hello, World!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

// Render the App component to the DOM
ReactDOM.render(<App />, document.getElementById('root'));
