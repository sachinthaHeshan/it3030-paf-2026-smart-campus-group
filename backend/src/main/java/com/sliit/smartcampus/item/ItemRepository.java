package com.sliit.smartcampus.item;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access for items table using pure SQL (no ORM).
 */
@Repository
public class ItemRepository {

    private static final String SQL_SELECT_ALL = "SELECT id, name FROM items";

    private final JdbcTemplate jdbcTemplate;

    public ItemRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Item> findAll() {
        return jdbcTemplate.query(SQL_SELECT_ALL, (rs, rowNum) ->
                new Item(rs.getLong("id"), rs.getString("name")));
    }
}
