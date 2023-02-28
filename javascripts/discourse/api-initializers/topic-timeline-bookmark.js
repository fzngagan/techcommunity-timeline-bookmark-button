import { getOwner } from "discourse-common/lib/get-owner";
import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", (api) => {
  const user = api.getCurrentUser();
  //If User is not logged-in then return, Else proceed
  if (!user) {
    return;
  }

  api.createWidget("topic-timeline-bookmark", {
    tagName: "div.discourse-bookmark-button-wrapper",

    buildKey: () => `topic-timeline-bookmark`,
    
    //Will trigger when topic-timeline bookmark button is clicked. And internally it will call toggleBookmark of the Topic ocntroller to have default bookmark functionality.
    toggleBookmark() {
      const topicController = getOwner(this).lookup("controller:topic");
      topicController.send("toggleBookmark");
    },

    html(attrs) {
      //Content (i.e. bookmark button) to be rendered when widget is mounted.
      let contents = [];
      //Default Icon, Label and Tooltip values for bookmark button
      let tooltip = "bookmarked.help.bookmark";
      let label = "bookmarked.title";
      let buttonClass = "btn btn-default bookmark";
      let icon = "bookmark";
      let bookmarkedPosts = 0;
      if (attrs.topic) {
        //Get the bookmarked count for the topic.
        bookmarkedPosts = attrs.topic.bookmarkCount;
        //Post(s) already bookmarked then set button Icon, Label and Tooltip accordingly
        if (bookmarkedPosts > 0) {
          //Icon
          if (attrs.topic.bookmarks.some((bookmark) => bookmark.reminder_at)) {
            icon = "discourse-bookmark-clock";
          } else {
            icon = "bookmark";
          }

          //Label
          if (bookmarkedPosts === 0) {
            label = "bookmarked.title";
          } else if (bookmarkedPosts === 1) {
            label = "bookmarked.edit_bookmark";
          } else {
            label = "bookmarked.clear_bookmarks";
          }

          //Tooltip
          if (bookmarkedPosts === 0) {
            return I18n.t("bookmarked.help.bookmark");
          } 
          else if (bookmarkedPosts === 1) {
            if (
              attrs.topic.bookmarks.filter((bookmark) => bookmark.for_topic).length
            ) {
              tooltip = "bookmarked.help.edit_bookmark_for_topic";
            } else {
              tooltip = "bookmarked.help.edit_bookmark";
            }
          } else if (attrs.topic.bookmarks.some((bookmark) => bookmark.reminder_at)) {
            tooltip = "bookmarked.help.unbookmark_with_reminder";
          } else {
            tooltip = "bookmarked.help.unbookmark";
          }


          //Append CSS bookmarked class if bookmark is set
          if (bookmarkedPosts > 0) {
            buttonClass += " bookmarked";
          }
        }
      }

      //Adding bookmark button to content
      contents.push(
        this.attach("button", {
          action: "toggleBookmark",
          title: tooltip,
          label,
          icon,
          className: buttonClass,
        })
      );

      return contents;
    },

    bookmarksChanged() {
      this.scheduleRerender();
    },
  });

  //Refresh the topic-timeline-bookmark widget whenever the bookmarks:changes event is triggered.
  api.dispatchWidgetAppEvent(
    "topic-timeline-bookmark-container",
    "topic-timeline-bookmark",
    "bookmarks:changed"
  );

});
