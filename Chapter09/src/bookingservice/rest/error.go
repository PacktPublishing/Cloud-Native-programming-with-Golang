package rest

import (
	"net/http"
	"encoding/json"
)

type errorResponse struct {
	Msg string `json:"msg"`
}

func respondWithError(res http.ResponseWriter, msg string, code int) error {
	response := errorResponse{msg}
	jsonResponse, err := json.Marshal(&response)
	if err != nil {
		return err
	}

	res.WriteHeader(code)
	res.Header().Set("Content-Type", "application/json;charset=utf8")

	_, err = res.Write(jsonResponse)
	if err != nil {
		return err
	}

	return nil
}