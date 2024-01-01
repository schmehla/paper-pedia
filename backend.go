package main

import (
    "fmt"
    "log"
    "net/http"
    "html/template"
    "strings"
    "encoding/json"
    "io/ioutil"

    "github.com/PuerkitoBio/goquery"
)

type Article struct {
    Title   string
    Snippet string
    Url     string
}

func main() {
    http.HandleFunc("/", handleMain)
    http.HandleFunc("/wiki/", handleWiki)
    http.HandleFunc("/about", handleAbout)
    http.HandleFunc("/impressum", handleImpressum)
    http.HandleFunc("/search", handleSearch)
    http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static/"))))

    log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleMain(w http.ResponseWriter, r *http.Request) {
    http.Redirect(w, r, "/wiki/Main_Page", http.StatusFound)
}

func handleWiki(w http.ResponseWriter, r *http.Request) {
    page := strings.TrimPrefix(r.URL.Path, "/wiki/")
    base_url := "https://en.m.wikipedia.org"
    res, err := http.Get(base_url + "/wiki/" + page)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer res.Body.Close()

    if res.StatusCode != 200 {
        tmpl, _ := template.ParseFiles("templates/index_go.html")
        tmpl.Execute(w, nil)
        return
    }

    doc, err := goquery.NewDocumentFromReader(res.Body)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    main, _ := doc.Find("#bodyContent").Html()
    tmpl, _ := template.ParseFiles("templates/index_go.html")
    tmpl.Execute(w, map[string]interface{}{
        "Title": strings.ReplaceAll(page, "_", " "),
        "Main": template.HTML(main),
    })
}

func handleAbout(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "This is the about page")
}

func handleImpressum(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "This is the impressum page")
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
    searchWord := r.URL.Query().Get("q")
    if searchWord == "" {
        tmpl, _ := template.ParseFiles("templates/index_go.html")
        tmpl.Execute(w, nil)
        return
    }
    searchWord = strings.ReplaceAll(searchWord, " ", "+")

    articles, err := getWikipediaArticles(searchWord)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    var innerHTML strings.Builder
    innerHTML.WriteString("<table>")
    for _, a := range articles {
        innerHTML.WriteString(fmt.Sprintf("<tr><td><a href='/wiki/%s'>%s</a></td><td>%s</td></tr>", a.Url, a.Title, a.Snippet))
    }
    innerHTML.WriteString("</table>")

    tmpl, _ := template.ParseFiles("templates/index_go.html")
    tmpl.Execute(w, map[string]interface{}{
        "Title": "Search",
        "Main": template.HTML(innerHTML.String()),
    })
}

func getWikipediaArticles(searchWord string) ([]Article, error) {
    var articles []Article
    base_url := "https://en.wikipedia.org/w/api.php"
    resp, err := http.Get(fmt.Sprintf("%s?action=query&format=json&list=search&srsearch=%s", base_url, searchWord))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    var result map[string]interface{}
    json.Unmarshal(body, &result)

    query, ok := result["query"].(map[string]interface{})
    if !ok {
        return nil, fmt.Errorf("error parsing query data")
    }

    search, ok := query["search"].([]interface{})
    if !ok {
        return nil, fmt.Errorf("error parsing search data")
    }

    for _, item := range search {
        data := item.(map[string]interface{})
        title, _ := data["title"].(string)
        snippet, _ := data["snippet"].(string)

        articles = append(articles, Article{
            Title:   title,
            Snippet: snippet,
            Url:     title, // This needs to be URL-encoded or transformed appropriately
        })
    }

    return articles, nil
}