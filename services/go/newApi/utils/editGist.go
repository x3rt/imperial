package utils

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"newapi/models"
)

func EditGist(user *models.User, gistID, content string) (gist string, err error) {
	client := http.Client{}
	body, _ := json.Marshal("")

	req, err := http.NewRequest("PATCH", "https://api.github.com/gists/"+gistID, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "token "+*&user.GithubAccess)

	if err != nil {
		println(err.Error())
		return "", err
	}

	makeReq, err := client.Do(req)

	if err != nil {
		println(err.Error())
		return "", err
	}

	res := struct {
		ID string `json:"id"`
	}{}
	parsed, reqErr := ioutil.ReadAll(makeReq.Body)
	json.Unmarshal(parsed, &res)

	if reqErr != nil {
		println(err.Error())
		return "", err
	}

	return string(res.ID), nil
}
