$(() => {
    //declare all functions
    const scrapeArticle = () => {
      $.get("/scrape").then(data => {
        $("body").html(data);
      });
    };
  
    const saveArticle = function() {
      let id = $(this).data("id");
  
      $.ajax({
        url: `/article/${id}`,
        method: "PUT"
      }).then(data => {
        location.reload();
      });
    };
  
    const removeArticle = function() {
      let id = $(this).data("id");
  
      $.ajax({
        url: `/saved/remove/${id}`,
        method: "PUT"
      }).then(data => {
        location.reload();
      });
    };
  
    const viewComments = function() {
      let articleId = $(this).data("id");
  
      //Send request to grab the articles comments
      $.ajax({
        url: `/article/${articleId}`,
        method: "GET"
      }).then(data => {
        $('.modal-content').html(
              `<div class="modal-header">
                  <h4 class="modal-title">${data.title}</h4>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                  </button>)
              </div>
              <div class="modal-body">
                  <ul class="list-group"></ul>
                  <textarea name="comment" class="comment-content"></textarea>
              </div>
              <div class="modal-footer">
                  <button type="button" data-id="${
                    data._id
                  }" class="btn btn-primary btn-save-comment">Save Comment</button>
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>`
              );
  
        let totalComments = data.comment.length;
  
        //If there are no comments
        if (totalComments == 0) {
          let message = `<small class="text-muted">This article does not have any comments yet.</small>`;
          $(".modal-content").prepend(message);
        }
        //If comments exist
        else {
          let comments = data.comment;
          //loops through comments and appends to modal
          comments.forEach(comment => {
            $(".list-group").append(
              `<li class="list-group-item justify-content-between">
                          ${comment.body}
                          <span><i class="material-icons" data-id="${
                            comment._id
                          }">delete_forever</i></span>
                      </li>`
            );
          });
        }
  
        $(".modal").modal("show");
      });
    };
  
    const saveComment = function() {
      let id = $(this).data("id");
      let content = $(".comment-content")
        .val()
        .trim();
  
      if (content) {
        $.ajax({
          url: `/comment/${id}`,
          method: "POST",
          data: { body: content }
        }).then(data => {
          //clears comment field
          $(".comment-content").val("");
          //Hide modal
          $(".modal").modal("hide");
        });
      } else {
        $(".comment-content").val("");
        return;
      }
    };
  
    const deleteComment = function() {
      let id = $(this).data("id");
  
      $.ajax({
        url: `/comment/${id}`,
        method: "DELETE"
      }).then(data => {
        $(".modal").modal("hide");
      });
    };
  
    //Hides the scrape button if on the 'saved' page
    if (window.location.href.includes("saved")) {
      $(".scrape").hide();
    }
  
    //Scrollbar fix
    const contentBox = $(".comment-content");
    contentBox.scrollTop = contentBox.scrollHeight;
  
    //click events
    $(".scrape").on("click", scrapeArticle);
    $(".btn-save").on("click", saveArticle);
    $(".btn-remove").on("click", removeArticle);
    $(".btn-view-comments").on("click", viewComments);
  
    //Click events for dynamically created elements
    $(document).on("click", ".btn-save-comment", saveComment);
    $(document).on("click", ".material-icons", deleteComment);
  });
  