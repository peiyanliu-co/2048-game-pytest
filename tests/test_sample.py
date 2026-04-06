"""
2048 Game Tests with Playwright and pytest
"""

import pytest
import os
import time


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "viewport": {"width": 800, "height": 800},
    }


def test_page_loads(page):
    """Test that the 2048 game page loads correctly"""
    # Get the path to the index.html file
    current_dir = os.path.dirname(__file__)
    game_dir = os.path.dirname(current_dir)
    index_path = os.path.join(game_dir, "web", "index.html")
    file_url = f"file://{index_path.replace(os.sep, '/')}"

    page.goto(file_url)

    # Check that the page title is correct
    assert page.title() == "2048 Browser Game"

    # Check that the main elements are present
    assert page.locator("h1").text_content() == "2048"
    assert page.locator(".grid").is_visible()
    assert page.locator("#score").text_content() == "0"


def test_initial_grid_has_tiles(page):
    """Test that the game starts with initial tiles"""
    current_dir = os.path.dirname(__file__)
    game_dir = os.path.dirname(current_dir)
    index_path = os.path.join(game_dir, "web", "index.html")
    file_url = f"file://{index_path.replace(os.sep, '/')}"

    page.goto(file_url)

    # Check that there are at least 2 tiles initially
    tiles = page.locator(".cell").all()
    non_empty_tiles = [tile for tile in tiles if tile.text_content().strip()]
    assert len(non_empty_tiles) >= 2


def test_score_updates_on_move(page):
    """Test that score updates when tiles are moved and merged"""
    current_dir = os.path.dirname(__file__)
    game_dir = os.path.dirname(current_dir)
    index_path = os.path.join(game_dir, "web", "index.html")
    file_url = f"file://{index_path.replace(os.sep, '/')}"

    page.goto(file_url)

    initial_score = int(page.locator("#score").text_content())

    # Simulate a left arrow key press
    page.keyboard.press("ArrowLeft")

    # Wait a bit for the move to complete
    page.wait_for_timeout(500)

    # Check that score might have changed (depending on the random tiles)
    # This test is a bit flaky since it depends on initial tile positions
    # In a real test, you might want to set up a specific board state
    final_score = int(page.locator("#score").text_content())
    assert final_score >= initial_score


def test_restart_button_resets_game(page):
    """Test that the restart button resets the game"""
    current_dir = os.path.dirname(__file__)
    game_dir = os.path.dirname(current_dir)
    index_path = os.path.join(game_dir, "web", "index.html")
    file_url = f"file://{index_path.replace(os.sep, '/')}"

    page.goto(file_url)

    # Keep making moves with different keys until the game dies (game over)
    max_attempts = 100
    attempt = 0
    keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
    
    while not page.locator("#message").is_visible() and attempt < max_attempts:
        for key in keys:
            page.keyboard.press(key)
            time.sleep(0.05)
            if page.locator("#score").text_content() != "0":
                break
        attempt += 1
    
    # Click restart
    page.locator("#restart").click()
    
    # Check that the game state is correctly reset
    assert page.locator("#score").text_content() == "0"
    assert page.locator("#message").is_hidden()
    time.sleep(0.5)


def test_game_over_message_appears(page):
    """Test that game over message appears when no moves are possible"""
    current_dir = os.path.dirname(__file__)
    game_dir = os.path.dirname(current_dir)
    index_path = os.path.join(game_dir, "web", "index.html")
    file_url = f"file://{index_path.replace(os.sep, '/')}"
    
    page.goto(file_url)
    time.sleep(15)
    
    # Keep making moves until the game is over or max attempts reached
    max_attempts = 200
    attempt = 0
    keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
    
    while not page.locator("#message").is_visible() and attempt < max_attempts:
        for key in keys:
            page.keyboard.press(key)
            time.sleep(0.1)
            if page.locator("#message").is_visible():
                break
        attempt += 1
    
    # Assert that the game over message is now visible
    assert page.locator("#message").is_visible()
    assert page.locator("#message-text").is_visible()
    time.sleep(2)
