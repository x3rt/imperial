package v1

import (
	. "api/v1/auth"
	. "api/v1/document"
	. "api/v1/me"

	"github.com/gofiber/fiber/v2"
)

func Introduction(c *fiber.Ctx) error {
	return c.JSON(&fiber.Map{
		"success":       true,
		"message":       "Welcome to IMPERIAL's API!",
		"version":       1,
		"documentation": "https://docs.imperialb.in/",
	})
}

func GetDocument(c *fiber.Ctx) error {
	return Get(c)
}

func PostDocument(c *fiber.Ctx) error {
	return Post(c)
}

func PatchDocument(c *fiber.Ctx) error {
	return Edit(c)
}

func DeleteDocument(c *fiber.Ctx) error {
	return Delete(c)
}

func PostLogin(c *fiber.Ctx) error {
	return Login(c)
}

func PostSignup(c *fiber.Ctx) error {
	return Signup(c)
}

func DeleteLogout(c *fiber.Ctx) error {
	return Logout(c)
}

func GetMe(c *fiber.Ctx) error {
	return Me(c)
}
