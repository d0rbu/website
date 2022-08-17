import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Unstable_Grid2';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Tooltip from '@mui/material/Tooltip';
import { Parallax, useParallax, useParallaxController } from 'react-scroll-parallax';
import '../styles/Projects.scss';

// contentful graphql query
const query = `
{
  projectCollection {
    items {
      sys {
        id,
        publishedAt,
      },
      title,
      blurb,
      image {
        url,
      },
      blog {
        json,
      },
    }
  }
}
`


export default function Projects({ children }) {
  const theme = useTheme()

  const [scrollLength, setScrollLength] = useState(1000)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios.post(`https://graphql.contentful.com/content/v1/spaces/4ubly5b64zma/`,
      JSON.stringify({ query }),
      {
        headers: {
          "Content-Type": "application/json",
          // Authenticate the request
          Authorization: "Bearer Xkw8IR7BC5BIxCmOOe2GXYaUahjsg1KVTHzTXce1W3k",
        }
      },
      )
      .then(({ data, status, statusText }) => {
        if (status !== 200) {
          console.error(statusText);
        }

        // rerender the entire component with new data
        const items = data?.data?.projectCollection?.items
        if (items) {
          setProjects(items)
        }
      });
  }, []);
  
  return (
    <Container>
      <Stack direction="column" spacing={2}>
        <Parallax
          translateY={['60vh', '0vh']}
          startScroll={0}
          endScroll={scrollLength}
        >
          <Typography variant="h2">
            Projects
          </Typography>
          <Grid2 container spacing={{ xs: 2, sm: 3, md: 3 }} columns={{ xs: 4, sm: 9, md: 16 }}>
            {projects.map((project) => {
              return (
                <Grid2 xs={2} sm={3} md={4} key={project?.sys?.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={project?.image?.url}
                      alt={project?.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h4" component="div">
                        {project?.title}
                      </Typography>
                      <Typography variant="body">
                        {project?.blurb}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              )
            })}
          </Grid2>
        </Parallax>
      </Stack>
    </Container>
  )
}