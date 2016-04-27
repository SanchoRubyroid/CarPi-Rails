module CarPiList where

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

-- MODEL

type alias Model =
  { cars : List String }


initialModel : Model
initialModel =
  { cars = [] }

-- UPDATE

type Action = NoOp | SetCarsList (List String)

update : Action -> Model -> Model
update action model =
  case action of
    NoOp ->
      model
    SetCarsList newCarsList ->
      { model | cars = newCarsList }

-- VIEW

view : Signal.Address Action -> Model -> Html
view address model =
  let
    carItem car =
      a [ class "mdl-navigation__link", href ("/control/" ++ car) ] [ text car ]
    list =
      if List.isEmpty model.cars then
        [ a [ class "mdl-navigation__link", href "#" ] [ text "No Vehicles online"] ]
      else
        List.map carItem model.cars
  in
    div [] list

-- PORTS

port vehicles : Signal (List String)

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
