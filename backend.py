from flask import Flask, render_template, redirect, request
from bs4 import BeautifulSoup
import requests
from dataclasses import dataclass


@dataclass
class Article:
    def __init__(self, title, snippet):
        self.title = title
        self.snippet = snippet
        self.url = f"/wiki/{title}"

    title: str
    url: str
    snippet: str


app = Flask(__name__)


@app.route("/wiki/<string:page>", methods=["GET"])
def display_page(page):
    base_url = "https://en.m.wikipedia.org"
    response = requests.get(base_url + "/wiki/" + page)
    soup = BeautifulSoup(response.content, "html.parser")
    main = soup.find("div", attrs={"id": "bodyContent"})
    if main is None:
        return render_template(
            "index.html", title="Page not found", main="<h1>Page not found</h1>"
        )
    prefix = "data-"
    for span in main.find_all("span", class_="lazy-image-placeholder"):
        img_tag = soup.new_tag("img")
        for attr, value in span.attrs.items():
            if attr.startswith(prefix):
                img_tag[attr[len(prefix) :]] = value
        span.replace_with(img_tag)

    return render_template("index.html", title=page.replace("_", " "), main=main)


@app.route("/", methods=["GET"])
@app.route("/wiki", methods=["GET"])
@app.route("/wiki/", methods=["GET"])
def display_home():
    return redirect("/wiki/Main_Page")


@app.route("/about", methods=["GET"])
def display_about():
    return "This is the about page"


@app.route("/impressum", methods=["GET"])
def display_impressum():
    return "This is the impressum page"


@app.route("/search", methods=["GET"])
def display_search():
    search_word = request.args.get("q")
    if search_word is None:
        return render_template("index.html", title="Search", main="no search word")
    articles = get_wikipedia_articles(search_word)
    inner_html = "<table>"
    for a in articles:
        inner_html += (
            f"<tr><td><a href='{a.url}'>{a.title}</a></td><td>{a.snippet}</td></tr>"
        )
    inner_html += "</table>"
    return render_template("index.html", title="Search", main=inner_html)


def get_wikipedia_articles(search_word):
    base_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": search_word,
    }
    response = requests.get(base_url, params=params)
    data = response.json()
    print(data["query"]["search"])

    # Extract the titles of the articles
    articles = [
        Article(title=elem["title"], snippet=elem["snippet"])
        for elem in data["query"]["search"]
    ]
    return articles


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
