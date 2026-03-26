import Joke from './components/Joke'
import './App.css'
import JournalDisplay from './components/JournalDisplay';
import TestresultDisplay from './components/TestresultDisplay';



function App() {
  return (
    <div className="App">
      <h1>Joke Generator Using React and Joke API</h1>
      <Joke />
      
      <JournalDisplay /> 
      <TestresultDisplay />
      
    </div>
  );
}

export default App;