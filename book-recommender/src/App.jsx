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
    
    case "Set_Loading":
      return { ...state, isLoading: action.payload };

    case "Set_aiResponses":
      return { ...state, aiResponses: action.payload, isLoading:false}
      default:
      return state;
  }
};

export default function App() {

  const [state, dispatch] = useReducer(reducer, {

    genre: "",
    mood: "",
    level: "",
    isLoading: false,
    aiResponses: [] 
    
    }
   )

   const { genre, mood, level } = state;

   const availableMoodBasedOnGenre =
     (genre && listofMoodOption[genre]) 
    ? listofMoodOption[genre] 
    : [];

   const fetchRecommendations = useCallback(async() => {

    if (!genre || !mood || !level) return;

    dispatch({ type: "Set_Loading", payload: true });

    try {
   const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

   const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}` ,
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

 if (!response.ok) {
    const errorData = await response.json();
    throw Error(errorData.error?.message || "API Request Failed");
 }

   const data = await response.json()

    dispatch({
      type: "Set_aiResponses",
      payload: data?.candidates || []
    })
   } catch (err) {
      console.log(err);
      dispatch({ type: "Set_Loading", payload: false })
    }
  }, [genre, mood, level])
  
 useEffect(() => {
    if (genre && mood && level) {
      fetchRecommendations();
    }
  }, [genre, mood, level, fetchRecommendations]);

  return(
    <section className="app-container">
       <h1>AI Book Recommender</h1>
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
         
        <button className="fetch-button"
        disabled={state.isLoading || !state.genre || !state.mood || !state.level} 
         onClick={fetchRecommendations}>Get Recommendation</button>

      <br />
      <br />


     {state.isLoading ? (
          <div className="loading-state">
            <p> Finding the best books for you...</p>
          </div>
        ) : 

        (state.aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend?.content?.parts?.[0]?.text || "No recommendations found."}</p>
        </details>
      )))}
  </section>
     )
      };
  