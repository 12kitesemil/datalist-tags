(function ($) {

            

    $.fn.tagselector = function (options, callback) {
        var settings = $.extend({

        })
        return this.each(function () {
            const $targetelem = $(this);

            $(this).hide();

            const generatedId = 'tagselector_' + Math.floor(Math.random() * 1000000);

            const listId = generatedId + '-list';

            const renderContent = (id, element) => {
                // let id = "fjdskjflksdjlkfdsj";
                let html = `<div id=${id} class="row">

                <div class="input-group mb-3">
                <div class="tags-container-outer form-control d-flex flex-wrap align-items-center gx-5">
                    <span class="no-tags-msg text-muted">None selected</span>
                    <div id="" class="tags-container flex-shrink-1 me-2"> </div>
                    <input oninput="" type="text" class="audience-input form-control border-none audience-selector my-2" list="${id}-list" placeholder="Start typing to add..." style="display: none;min-width: 150px;width:100%;max-width: 350px;">

                </div>
                <button type="button" class="btn btn-outline-success add-audience-btn">
                    <svg width="16" height="16" fill="currentColor" class="bi bi-plus-circle" style="top: -2px;position: relative;">
                        <use xlink:href="#imgPlusCircle"></use>
                    </svg>
                </button>
            </div>
            <datalist id="${id}-list" class="audience-list"></datalist>
        </div>   
        <svg xmlns="http://www.w3.org/2000/svg" style="visibility:hidden; display: none;">
            <symbol id="imgPlusCircle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </symbol>
            <symbol id="imgX" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </symbol>
        </svg>        `
                element.after(html)
                
             }   

            renderContent(generatedId, $targetelem);

            const $control = $(`#${generatedId}`);

            let processedOptions = [];

            const tagsContainer = $(`#${generatedId} .tags-container`);
            const datalist = $(`#${generatedId}-list`);


            const enableAddAudienceButton = () => {
                $control.find('.add-audience-btn').removeClass('disabled').removeAttr('disabled');
            }
            const disableAddAudienceButton = () => {
                $control.find('.add-audience-btn').addClass('disabled').attr('disabled', 'disabled');
            }
            const showAudienceInput = (andFocus) => {
                $control.find('.audience-input').show();
                if (andFocus) {
                    $control.find('.audience-input').focus();
                }
            }
            const hideAudienceInput = () => {
                $control.find('.audience-input').hide();
            }

            const getKeyByValue = function (object, value) {
                return Object.keys(object).find(key => object[key] === value);
            }

            const getOptionByValue = function (value) {

                let a = processedOptions.filter(option => {
                    return option.value === value
                });
                if (a.length > 0) {
                    return a[0];
                }
            }

            const appendOptionToDatalist = function (option) {
                let html = optionToDataListElement(option)
                datalist.prepend(html)
            }

            const onAudienceChange = () => {
                if (tagsContainer.children().length === 0) {
                    enableAddAudienceButton();
                    hideAudienceInput();
                    $control.find('.no-tags-msg').show()
                } else {
                    $control.find('.no-tags-msg').hide()
                }
                regenerateDataListFromSelectElement()
            }

            //the click handler is on the cross element rather than the entire tag, so we look at the parent for the 
            //value and also remove the parent. 
            const tagClickHandler = function () {

                let selectedValue = $(this)
                //add value back to the selection pool
                let value = selectedValue.parent().attr('data-item-value');
                let option = getOptionByValue(value);
                removeOptionFromFormSelectControl(option);

                $(this).parent().remove()
                onAudienceChange();
            }

            const addOptionToFormSelectControl = (option) => {
                $targetelem.find(`option[value="${option.value}"]`).attr('selected', 'selected')
            }
            const removeOptionFromFormSelectControl = (option) => {
                $targetelem.find(`option[value="${option.value}"]`).removeAttr('selected')
            }

            const onAudienceInput = function (e) {

                let input = $control.find('.audience-input')
                let options = document.querySelector(`#${listId}`).childNodes

                let selectedOption = false;
                let changeHappened = false;

                for (let i = 0; i < options.length; i++) {
                    let option = options[i]
                    let humanFriendlyValue = options[i].value

                    if (humanFriendlyValue === input.val()) {
                        selectedOption = option;

                        break;
                    }
                }
                if (selectedOption) {
                    let dv = $(selectedOption).attr('data-value');
                    if (dv) {
                        let option = getOptionByValue(dv)
                        if (option) {
                            createTagElement(option)
                            $(selectedOption).remove()
                        }
                    }

                    input.val('')

                    changeHappened = true;
                }
                if (changeHappened) {
                    onAudienceChange();
                    hideAudienceInput();
                    enableAddAudienceButton();
                }
            }

            function createTagElement(option) {
                tagsContainer.append(function () {
                    let outer = $(`<span class="tag-item badge rounded-pill text-bg-primary me-1 ps-3" data-item-value="${option.value}"><span class="tag-label">${option.label}</span></span>`);
                    let cross = $(`
        <span class="cross-button"><svg width="20" height="20" fill="currentColor" class="bi bi-x ms-1">
            <use xlink:href="#imgX"></use>
        </svg>
        </span>
    `)
                    cross.click(tagClickHandler)
                    return outer.append(cross)
                })

                $control.find('.no-tags-msg').hide()
                addOptionToFormSelectControl(option)
            }

            function regenerateDataListFromSelectElement() {
                let s = _processSelect().filter(option => {
                    return !option.selected
                });
                let html = s.map(optionToDataListElement).join("\n");
                datalist.html(html)
            }

            $control.find('.add-audience-btn').click(function () {
                showAudienceInput(true);
                disableAddAudienceButton();
            })
            const _processSelect = () => {
                let options = $targetelem.find(`option`);
                let res = [];
                for (let i = 0; i < options.length; i++) {
                    let option = options[i];
                    let value = option.value;
                    let label = option.innerHTML;
                    let selected = false;
                    let selectedAttr = option.getAttribute('selected')
                    if (typeof selectedAttr !== 'undefined' && selectedAttr !== false && selectedAttr !== null) {
                        selected = true;
                    }
                    res.push({
                        value: value,
                        label: label,
                        order: i,
                        selected: selected
                    })
                }
                return res;
            }

            const processOptionsFromSelect = () => {
                processedOptions = _processSelect();
            }

            const optionToDataListElement = (option, selected) => {
                let res = `<option class="list-option" data-value="${option.value}">${option.label}</option>`
                return res;
            }

            const initDataList = () => {
                processedOptions.forEach(element => {
                    if (!element.selected) {
                        let html = optionToDataListElement(element)
                        datalist.append(html)
                    } else {
                        createTagElement(element)
                    }
                });
            }

            const initLayout = () => {
                if (tagsContainer.children().length) {
                    $control.find('.no-tags-msg').hide()
                } else {
                    $control.find('.no-tags-msg').show()
                }
            }

            const init = () => {
                $(`#${generatedId} .audience-selector`).on('input', onAudienceInput);
                processOptionsFromSelect();
                initDataList();
                onAudienceChange();
            }

            

            init();

        })
    }



})(jQuery);
