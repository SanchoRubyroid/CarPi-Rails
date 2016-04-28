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
    disabledLink linkText=
      span [ ] [ text linkText ]
    carItem car =
      a [ class "mdl-navigation__link", href ("/control/" ++ car) ] [ text car ]
    capturedCarItem car =
      disabledLink car
    list =
      if List.isEmpty model.cars && List.isEmpty model.capturedCars then
        [ disabledLink "No Vehicles online" ]
      else
        List.append (List.map carItem model.cars) (List.map capturedCarItem model.capturedCars)
  in
    div [] list

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
