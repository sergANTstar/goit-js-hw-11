import NewsApiServer from './js/news_servise'
import Notiflix from 'notiflix';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import throttle from 'lodash.throttle';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('[data-action="load-more"]'),
    btnPrimary: document.querySelector('btn-primary'),
    reciveMsg: document.createElement('p')
}
const newsApiServer = new NewsApiServer();
const galleryLigthbox = new SimpleLightbox(".gallery a");
let pages;

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMore.addEventListener('click', onLoadMoreImg)
refs.loadMore.classList.add("is-hidden")

function onSearch(e) {
    e.preventDefault();
    searchNextElm();
    refs.loadMore.classList.add('is-hidden')
    newsApiServer.query = e.currentTarget.elements.searchQuery.value;

    if (newsApiServer.query === ' ' || newsApiServer.query === '') {
        return Notify.info("Please, enter search text!")
    }

    newsApiServer.resetCurrentPage();
    deleteMsg()
    newsApiServer.fetchImages()
        .then(({ totalHits, hits }) => {
            pages = Math.ceil(totalHits / hits.length);
            if (hits.length === 0) {
                Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again');
                return;
            };
            rendeElemToHTML(hits);
            refs.loadMore.classList.remove('is-hidden');
            if (pages === 1) {
                refs.loadMore.classList.add('is-hidden');
                refs.loadMore.classList.add('is-hidden');
                refs.reciveMsg.textContent = "We're sorry, but you've reached the end of search results.";
                refs.reciveMsg.classList.add('reciveMsg');
                refs.gallery.after(refs.reciveMsg)
            }
        })
        .catch(error => console.log(error));
}

function searchNextElm() {
    refs.gallery.innerHTML = '';
}

function deleteMsg() {
    if (refs.reciveMsg) {
        refs.reciveMsg.remove()
    }
}

function onLoadMoreImg() {
    newsApiServer.fetchImages().then(({ hits }) => {
        if (pages === newsApiServer.uppdatePage()) {
            refs.loadMore.classList.add('is-hidden');
            refs.reciveMsg.textContent = "We're sorry, but you've reached the end of search results.";
            refs.reciveMsg.classList.add('reciveMsg');
            refs.gallery.after(refs.reciveMsg)
        }
        rendeElemToHTML(hits);
    });
}

function rendeElemToHTML(hits) {
    const gallery = hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `<li class="photo-card">
                    <div class="card-item">
                            <a href="${largeImageURL}" class="gallery__image">
                                <img src="${webformatURL}" alt="${tags}" loading="lazy" width="190">
                            </a>
                            <ul class="info">
                                <li class="info-item">
                                    <b>Likes</b><br>${likes}
                                </li>
                                <li class="info-item">
                                    <b>Views</b><br>${views}
                                </li>
                                <li class="info-item">
                                    <b>Comments</b><br>${comments}
                                </li>
                                <li class="info-item">
                                    <b>Downloads</b><br>${downloads}
                                </li>
                            </ul>
                    </div>
                </li>`
    }).join('')
    refs.gallery.insertAdjacentHTML('beforeend', gallery)
    galleryLigthbox.refresh();
}