module CarPiList where

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

-- MODEL

type alias Model =
  { cars : List String,
    capturedCars : List String
  }


initialModel : Model
initialModel =
  { cars = [],
    capturedCars = []
  }

-- UPDATE

type Action = NoOp | SetCarsList ((List String), (List String))

update : Action -> Model -> Model
update action model =
  case action of
    NoOp ->
      model
    SetCarsList newCarsList ->
      { model |
        cars = fst newCarsList,
        capturedCars = snd newCarsList
      }

-- VIEW

view : Signal.Address Action -> Model -> Html
view address model =
  let
    buildCardLink location linkText =
      a [ class "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect", href location ] [ text linkText ]
    carLink car captured =
      if captured then
        buildCardLink "#" "Request Release"
      else
        buildCardLink ("/control/" ++ car) "Control"
    carItem car captured =
      div [ class "mdl-cell mdl-cell--12-col" ] [
        div [ class "mdl-card mdl-shadow--2dp center-card car-card" ] [
          div [ class "mdl-card__title default-pic" ] [ h2 [ class "mdl-card__title-text mdl-color-text--white" ] [ text car ] ],
          div [ class "mdl-card__actions mdl-card--border" ] [ carLink car captured ],
          div [ class "mdl-card__menu" ] [
            button [ class "mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" ] [ i [ class "material-icons" ] [ text "share" ] ]
          ]
        ]
      ]
    activeCarItem car =
      carItem car False
    capturedCarItem car =
      carItem car True
    list =
      if List.isEmpty model.cars && List.isEmpty model.capturedCars then
        [ h1 [ class "center-it" ] [ text "No Vehicles online" ] ]
      else
        List.append (List.map activeCarItem model.cars) (List.map capturedCarItem model.capturedCars)
  in
    div [ class "mdl-grid" ] list

-- PORTS

port vehicles : Signal ((List String), (List String))

-- SIGNALS

inbox : Signal.Mailbox Action
inbox =
  Signal.mailbox NoOp


actions : Signal Action
actions =
  Signal.merge inbox.signal (Signal.map SetCarsList vehicles)


model : Signal Model
model =
  Signal.foldp update initialModel actions


main : Signal Html
main =
  Signal.map (view inbox.address) model
