import React, { useReducer, useEffect, useCallback } from "react"
import SelectField from "./components/Select.jsx"
import listofMoodOption from "./store/mood.json"
import listofGenreOption from "./store/genre.json"
import "./App.css"

const reducer = (state, action) => {

  switch(action.type) {
    case "Set_Genre":
      return { ...state, genre: action.payload, mood: "" }
  
    case "Set_Mood":
      return { ...state, mood: action.payload, }
    
    case "Set_Level":
      return { ...state, level: action.payload, }
    
    case "Set_aiResponses":
      return { ...state, aiResponses: action.payload || []}
      default:
      return state;
  }
};

export default function App() {

  const [state, dispatch] = useReducer(reducer, {

    genre: "",
    mood: "",
    level: "",
    aiResponses: [] 
    }
   )

   const availableMoodBasedOnGenre =
    listofMoodOption[state.genre] || []

   const fetchRecommendations = useCallback(async() => {

   const { genre, mood, level } = state;

    if (!genre || !mood || !level) return;

    try {
   const GEMINI_API_KEY = 'AIzaSyAJOWFONwEW6E4JHy__5peI9KIy0Z64Ch0';

   const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}` ,
  {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
    
     contents: [
    {
      parts: [
        { text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.` }
      ]
    }
  ]
})
})

   const data = await response.json()
    console.log(data)

    dispatch({
      type: "Set_aiResponses",
      payload: data?.candidates || []
    })
   } catch (err) {
      console.log(err);
    }
  }, [state])
  
  useEffect(() => {
     fetchRecommendations()
  }, [fetchRecommendations])
  
  return(
    <section>
       <h1>Book Recommender</h1>
       <SelectField
        placeholder="Select a genre"
        id="genre"
        options={listofGenreOption}
        value={state.genre}
        onSelect={(value) =>
        dispatch ({type: "Set_Genre" , payload: value})
          }
      />
        
       <SelectField
        placeholder="Select a mood"
        id="mood"
        options={availableMoodBasedOnGenre}
        value={state.mood}
        onSelect={(value) =>
        dispatch ({type: "Set_Mood" , payload: value})
         }
        />

        <SelectField
        placeholder="Select your level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={state.level}
        onSelect={(value) =>
        dispatch ({type: "Set_Level" , payload: value})
         }
        />

      <br />
         
        <button onClick={fetchRecommendations}>Get Recommendation</button>

      <br />
      <br />

     {state.aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend?.content?.parts?.[0]?.text}</p>
        </details>
      ))}
  </section>
     )
      };
  