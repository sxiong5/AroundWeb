package main

import (
	"mime/multipart"
	"reflect"

	"github.com/olivere/elastic/v7"
)

const (
	POST_INDEX = "post"
)

type Post struct {
	Id      string `json:"id"`
	User    string `json:"user"`
	Message string `json:"message"`
	Url     string `json:"url"`
	Type    string `json:"type"`
}

func searchPostsByUser(user string) ([]Post, error) {
	query := elastic.NewTermQuery("user", user)
	searchResult, err := readFromES(query, POST_INDEX)
	if err != nil {
		return nil, err
	}

	var posts []Post
	var ptype Post
	for _, item := range searchResult.Each(reflect.TypeOf(ptype)) {
		p := item.(Post)
		posts = append(posts, p)
	}
	return posts, nil
}

func searchPostsByKeywords(keywords string) ([]Post, error) {
	query := elastic.NewMatchQuery("message", keywords)
	query.Operator("AND")
	if keywords == "" {
		query.ZeroTermsQuery("all")
	}

	searchResult, err := readFromES(query, POST_INDEX)
	if err != nil {
		return nil, err
	}

	var posts []Post
	var ptype Post
	for _, item := range searchResult.Each(reflect.TypeOf(ptype)) {
		p := item.(Post)
		posts = append(posts, p)
	}
	return posts, nil
}

func savePost(post *Post, file multipart.File) error {
	mediaLink, err := saveToGCS(file, post.Id)
	if err != nil {
		return err
	}

	post.Url = mediaLink
	return saveToES(post, POST_INDEX, post.Id)
}
